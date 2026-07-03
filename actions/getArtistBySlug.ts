import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Artist } from "@/types";

export const getArtistBySlug = async (slug: string): Promise<Artist | null> => {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("artists")
    .select(`
      id,
      name,
      bio,
      avatar_path,
      hero_path,
      slug,
      is_popular,
      created_at,
      instagram_url,
      twitter_url,
      reddit_profile_url,
      subreddit_url
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[getArtistBySlug] error:", error.message);
    return null;
  }

  return data as Artist;
};
