import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

const getFeaturedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({ cookies });

  // 1) grab the top 50 songs by views
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('views', { ascending: false })
    .limit(50);

  if (error) {
    console.error('getFeaturedSongs error', error.message);
    return [];
  }
  if (!data) return [];

  // 2) randomize them in JS
  const shuffled = [...data].sort(() => Math.random() - 0.5);

  // 3) return the first 12 as “Featured”
  return shuffled.slice(0, 12);
};

export default getFeaturedSongs;
