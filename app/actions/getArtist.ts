import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export type DbArtist = {
  id: string;
  name: string;
  bio: string | null;
  avatar_path: string | null;
  hero_path: string | null;
  created_at: string;
};

export async function getArtist(id: string): Promise<DbArtist | null> {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('artists')
    .select('id,name,bio,avatar_path,hero_path,created_at')
    .eq('id', id)
    .single();
  if (error) {
    console.error('[getArtist]', error.message);
    return null;
  }
  return data;
}
