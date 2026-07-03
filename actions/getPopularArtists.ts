import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularArtists() {
  const supabase = createServerComponentClient({ cookies });

  // Use pinned_popular_artists table instead of artists.is_popular
  const { data, error } = await supabase
    .from("pinned_popular_artists")
    .select("position, artists(*)")
    .order("position", { ascending: true })
    .limit(12);

  if (error) {
    console.error("Error loading pinned popular artists", error);
    return [];
  }

  return (data ?? []).map((row: any) => row.artists).filter(Boolean);
}
