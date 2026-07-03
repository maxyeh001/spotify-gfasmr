import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getTrendingSongs() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("pinned_trending_songs")
    .select("position, songs(*, artists(slug))")
    .order("position", { ascending: true })
    .limit(12);

  if (error) {
    console.error("Error loading pinned trending songs", error);
    return [];
  }

  // Flatten to songs and attach artist_slug for URL building
  return (data ?? [])
    .map((row: any) => {
      const s = row.songs;
      if (!s) return null;

      return {
        ...s,
        artist_slug: s.artists?.slug ?? null,
      };
    })
    .filter(Boolean);
}
