import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import SongPageClient from "./song-page-client";

export const revalidate = 0;

export default async function SongPage({
  params,
}: {
  params: { artist: string; song: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // Find artist by slug
  const { data: artist, error: artistErr } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", params.artist)
    .single();

  if (artistErr || !artist) return notFound();

  // Find song by slug + artist_id
  const { data: song, error: songErr } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", artist.id)
    .eq("slug", params.song)
    .single();

  if (songErr || !song) return notFound();

  return <SongPageClient artist={artist} song={song} />;
}
