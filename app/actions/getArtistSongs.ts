import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

type Row = Song & { liked_songs: { count: number }[] };

export async function getArtistSongs(artistId: string): Promise<{ popular: Song[]; others: Song[] }> {
  const supabase = createServerComponentClient({ cookies });

  // Pull songs for this artist + aggregate like counts
  const { data, error } = await supabase
    .from('songs')
    .select('*, liked_songs(count)')
    .eq('artist_id', artistId);

  if (error || !data) {
    console.error('[getArtistSongs]', error?.message);
    return { popular: [], others: [] };
  }

  const rows = (data as Row[]).map((r) => ({ ...r, _likes: r.liked_songs?.[0]?.count ?? 0 }));

  // Sort by like count desc
  rows.sort((a: any, b: any) => b._likes - a._likes);

  const popular = rows.slice(0, 10);
  const others = rows.slice(10);

  // Drop the helper field
  return {
    popular: popular.map(({ _likes, ...rest }: any) => rest),
    others: others.map(({ _likes, ...rest }: any) => rest),
  };
}
