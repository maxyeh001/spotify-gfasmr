// app/actions/getPlaylistWithSongs.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

export type PlaylistWithSongs = {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  songs: Song[];
};

export async function getPlaylistWithSongs(id: string): Promise<PlaylistWithSongs | null> {
  const supabase = createServerComponentClient({ cookies });

  const { data: playlist, error: pErr } = await supabase
    .from('playlists')
    .select('id,name,description,image_path')
    .eq('id', id)
    .single();

  if (pErr || !playlist) {
    console.error('[getPlaylistWithSongs] playlist', pErr?.message);
    return null;
  }

  // join through playlist_songs to fetch full song rows
  const { data: links, error: lErr } = await supabase
    .from('playlist_songs')
    .select('position, songs(*)')
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  if (lErr) {
    console.error('[getPlaylistWithSongs] links', lErr.message);
  }

  const songs: Song[] = (links ?? [])
    .map((row: any) => row.songs)
    .filter(Boolean);

  return { ...playlist, songs };
}
