// app/actions/getPlaylists.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export type DbPlaylist = {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
};

export async function getPlaylists(limit = 10): Promise<DbPlaylist[]> {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('playlists')
    .select('id,name,description,image_path,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getPlaylists]', error.message);
    return [];
  }
  return data ?? [];
}
