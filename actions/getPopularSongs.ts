import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularSongs(limit = 100) {
  const supabase = createServerComponentClient({ cookies });

  // 1) Get songs from your weighted-random RPC (includes songs.slug)
  const { data: songs, error } = await supabase.rpc("get_weighted_random_songs", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error loading weighted random songs", error);
    return [];
  }

  const list = songs ?? [];
  const artistIds = Array.from(
    new Set(list.map((s: any) => s.artist_id).filter(Boolean))
  );

  // 2) Fetch artist slugs for these songs
  const { data: artists, error: aErr } = await supabase
    .from("artists")
    .select("id, slug")
    .in("id", artistIds);

  if (aErr) {
    console.error("Error loading artist slugs", aErr);
    // still return songs (they’ll just play; links may not work)
    return list;
  }

  const map = new Map((artists ?? []).map((a: any) => [a.id, a.slug]));

  // 3) Attach artist_slug onto each song
  return list.map((s: any) => ({
    ...s,
    artist_slug: map.get(s.artist_id) ?? null,
  }));
}
