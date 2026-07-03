// actions/getArtistSongs.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

type Row = Song & { liked_songs: { count: number }[] };

export async function getArtistSongs(
  artistId: string
): Promise<{ popular: Song[]; others: Song[] }> {
  const supabase = createServerComponentClient({ cookies });

  // songs for this artist + aggregate like counts (from liked_songs)
  const { data, error } = await supabase
    .from('songs')
    .select('*, liked_songs(count)')
    .eq('artist_id', artistId);

  if (error || !data) {
    console.error('[getArtistSongs]', error?.message);
    return { popular: [], others: [] };
  }

  // Attach derived like counts to the song objects so the UI can sort/display them.
  const rows: Song[] = (data as Row[]).map((r) => ({
    ...(r as any),
    likes: r.liked_songs?.[0]?.count ?? 0,
  }));

  // Default popularity ordering = most likes first.
  rows.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  const popular = rows.slice(0, 10);
  const others = rows.slice(10);

  return { popular, others };
}
