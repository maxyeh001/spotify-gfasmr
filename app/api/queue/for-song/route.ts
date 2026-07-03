import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function keywords(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 6);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const artistId = url.searchParams.get("artistId");
  const songId = url.searchParams.get("songId");
  const title = url.searchParams.get("title") ?? "";

  if (!artistId || !songId) {
    return NextResponse.json({ error: "Missing artistId or songId" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1) Same artist, randomized so shared one-song links still lead
  // somewhere fresh when the local player queue is exhausted.
  const { data: sameArtistRows } = await supabase
    .from("songs")
    .select("id")
    .eq("artist_id", artistId)
    .neq("id", songId)
    .limit(100);

  const sameArtist = [...(sameArtistRows ?? [])]
    .sort(() => Math.random() - 0.5)
    .slice(0, 40);

  // 2) “Similar” by title keywords (fallback: views)
  const words = keywords(title);

  let similar: { id: string }[] = [];
  if (words.length) {
    // simple OR match using ilike
    // NOTE: Supabase doesn't support OR easily in the JS client without `.or()`
    const or = words.map((w) => `title.ilike.%${w}%`).join(",");
    const { data } = await supabase
      .from("songs")
      .select("id")
      .neq("id", songId)
      .or(or)
      .order("views", { ascending: false })
      .limit(80);

    similar = data ?? [];
  } else {
    const { data } = await supabase
      .from("songs")
      .select("id")
      .neq("id", songId)
      .order("views", { ascending: false })
      .limit(80);

    similar = data ?? [];
  }

  // Merge into a queue (no duplicates)
  const seen = new Set<string>();
  const queueIds: string[] = [];

  const push = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    queueIds.push(id);
  };

  push(songId);
  (sameArtist ?? []).forEach((s) => push(s.id));
  (similar ?? []).forEach((s) => push(s.id));

  return NextResponse.json({ queueIds });
}
