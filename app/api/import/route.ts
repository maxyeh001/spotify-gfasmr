import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Simple CSV parser: assumes commas, header row, basic quoting only
function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',').map((c) =>
      c.trim().replace(/^"|"$/g, '') // remove simple surrounding quotes
    );
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

export async function POST(req: Request) {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      log('❌ Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized', logs }, { status: 401 });
    }

    // Optional: enforce admin-only via profiles.role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) {
      log(`❌ Error loading profile: ${profileErr.message}`);
      return NextResponse.json(
        { error: 'Profile lookup failed', logs },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== 'admin') {
      log('❌ Forbidden: user is not admin');
      return NextResponse.json({ error: 'Forbidden', logs }, { status: 403 });
    }

    const form = await req.formData();

    const csvFile = form.get('csv') as File | null;
    if (!csvFile) {
      log('❌ Missing CSV file in formData');
      return NextResponse.json({ error: 'Missing CSV', logs }, { status: 400 });
    }

    // Parse CSV
    const csvText = await csvFile.text();
    const rows = parseCsv(csvText);
    log(`Found ${rows.length} data rows in CSV`);

    // Uploaded files
    const audioFiles = form.getAll('songs') as File[];
    const imageFiles = form.getAll('images') as File[];

    log(`Received ${audioFiles.length} audio file(s), ${imageFiles.length} image file(s)`);

    const findFile = (name: string, files: File[]) =>
      files.find((f) => f.name === name);

    for (const row of rows) {
      const {
        audio_file,
        image_file,
        title,
        artist_name,
        artist_bio,
        playlist_name,
        playlist_position,
        audio_path,
        image_path,
      } = row;

      // REQUIRED FIELDS
      if (!audio_file || !title || !artist_name) {
        log(`Skipping row (missing required fields): ${JSON.stringify(row)}`);
        continue;
      }

      log(`Processing "${title}" by "${artist_name}"`);

      // -------- Artist: find or create --------
      let { data: artist, error: artistErr } = await supabase
        .from('artists')
        .select('*')
        .eq('name', artist_name)
        .maybeSingle();

      if (artistErr) {
        log(`  ⚠️ Error querying artist "${artist_name}": ${artistErr.message}`);
      }

      if (!artist) {
        const { data: createdArtist, error: createArtistErr } = await supabase
          .from('artists')
          .insert({
            name: artist_name,
            bio: artist_bio || null,
            avatar_path: null,
            hero_path: null,
          })
          .select('*')
          .single();

        if (createArtistErr || !createdArtist) {
          log(`  ❌ Failed to create artist "${artist_name}": ${createArtistErr?.message}`);
          continue;
        }

        artist = createdArtist;
        log(`  ✅ Created artist: ${artist_name}`);
      }

      // -------- Audio upload (to songs bucket) --------
      const audioFile = findFile(audio_file, audioFiles);
      if (!audioFile) {
        log(`  ⚠️ Audio file not found in upload: ${audio_file}`);
        continue;
      }

      const audioStoragePath =
        (audio_path && String(audio_path).trim()) ||
        `imports/${Date.now()}-${audioFile.name}`;

      const { error: audioUploadErr } = await supabase.storage
        .from('songs')
        .upload(audioStoragePath, audioFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (audioUploadErr) {
        log(
          `  ❌ Failed to upload audio "${audio_file}" to "${audioStoragePath}": ${audioUploadErr.message}`
        );
        continue;
      }

      // -------- Image upload (optional) --------
      let finalImagePath: string | null = null;

      if (image_file) {
        const imageFile = findFile(image_file, imageFiles);
        if (!imageFile) {
          log(`  ⚠️ Image file listed but not uploaded: ${image_file}`);
        } else {
          const imageStoragePath =
            (image_path && String(image_path).trim()) ||
            `imports/${Date.now()}-${imageFile.name}`;

          const { error: imageUploadErr } = await supabase.storage
            .from('images')
            .upload(imageStoragePath, imageFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (imageUploadErr) {
            log(
              `  ⚠️ Failed to upload image "${image_file}" to "${imageStoragePath}": ${imageUploadErr.message}`
            );
          } else {
            finalImagePath = imageStoragePath;
            log(`  ✅ Uploaded image: ${image_file} -> ${imageStoragePath}`);
          }
        }
      }

      // -------- Create song --------
      const { data: song, error: songErr } = await supabase
        .from('songs')
        .insert({
          title,
          author: artist_name,
          artist_id: artist.id,
          song_path: audioStoragePath,
          image_path: finalImagePath,
          user_id: user.id,
        })
        .select('*')
        .single();

      if (songErr || !song) {
        log(`  ❌ Failed to insert song "${title}": ${songErr?.message}`);
        continue;
      }

      log(`  ✅ Created song: ${song.title}`);

      // -------- Playlist (optional) --------
      if (playlist_name) {
        let { data: playlist, error: playlistErr } = await supabase
          .from('playlists')
          .select('*')
          .eq('name', playlist_name)
          .maybeSingle();

        if (playlistErr) {
          log(
            `  ⚠️ Error checking playlist "${playlist_name}": ${playlistErr.message}`
          );
        }

        if (!playlist) {
          const { data: createdPlaylist, error: createPlaylistErr } =
            await supabase
              .from('playlists')
              .insert({
                name: playlist_name,
                description: null,
                image_path: null,
              })
              .select('*')
              .single();

          if (createPlaylistErr || !createdPlaylist) {
            log(
              `  ❌ Failed to create playlist "${playlist_name}": ${createPlaylistErr?.message}`
            );
            continue;
          }

          playlist = createdPlaylist;
          log(`  ✅ Created playlist: ${playlist_name}`);
        }

        const pos = playlist_position ? Number(playlist_position) : null;

        const { error: linkErr } = await supabase.from('playlist_songs').insert({
          playlist_id: playlist.id,
          song_id: song.id,
          position: Number.isFinite(pos) ? pos : null,
        });

        if (linkErr) {
          log(
            `  ⚠️ Failed to link song to playlist "${playlist_name}": ${linkErr.message}`
          );
        } else {
          log(`  ✅ Added to playlist "${playlist_name}"`);
        }
      }
    }

    log('✅ IMPORT COMPLETE');
    return NextResponse.json({ logs });
  } catch (err: any) {
    log(`❌ Unexpected server error: ${err?.message || String(err)}`);
    return NextResponse.json(
      { error: 'Internal server error', logs },
      { status: 500 }
    );
  }
}
