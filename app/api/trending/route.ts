import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const limit = Number(url.searchParams.get("limit") ?? 24);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Trending "Show all" should start with the same pinned items used on the homepage
   * (pinned_trending_songs), then fill the rest with the normal trending query.
   *
   * We paginate across the *combined* list (pinned first, then the rest), using `offset`
   * as an index into that combined list.
   */

  // 1) Load pinned list (same shape as getTrendingSongs)
  const { data: pinnedRows, error: pinnedErr } = await supabase
    .from("pinned_trending_songs")
    .select("position, songs(*, artists(slug))")
    .order("position", { ascending: true });

  if (pinnedErr) {
    return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
  }

  const pinned = (pinnedRows ?? [])
    .map((row: any) => {
      const s = row.songs;
      if (!s) return null;
      return {
        ...s,
        artist_slug: s.artists?.slug ?? null,
      };
    })
    .filter(Boolean);

  const pinnedIds = pinned.map((s: any) => s.id).filter((id: any) => id != null);
  const pinnedCount = pinned.length;

  // 2) Figure out which slice of pinned is included in this page
  const pinnedStart = Math.min(offset, pinnedCount);
  const pinnedEnd = Math.min(offset + limit, pinnedCount);
  const pinnedSlice = pinned.slice(pinnedStart, pinnedEnd);

  // 3) Fill remaining slots from the general trending query (excluding pinned ids)
  const remaining = Math.max(0, limit - pinnedSlice.length);
  const restOffset = Math.max(0, offset - pinnedCount);

  let restItems: any[] = [];
  if (remaining > 0) {
    let q = supabase
      .from("songs")
      .select("*, artists!inner(slug)")
      .order("views", { ascending: false })
      .order("created_at", { ascending: false });

    if (pinnedIds.length > 0) {
      // songs.id is numeric in this project; build an IN list without quotes.
      q = q.not("id", "in", `(${pinnedIds.join(",")})`);
    }

    const { data: rest, error: restErr } = await q.range(
      restOffset,
      restOffset + remaining - 1
    );

    if (restErr) {
      return NextResponse.json({ error: restErr.message }, { status: 500 });
    }

    restItems = (rest ?? []).map((s: any) => ({
      ...s,
      artist_slug: s.artists?.slug ?? null,
    }));
  }

  const items = [...pinnedSlice, ...restItems];

  return NextResponse.json({
    items,
    nextOffset: offset + items.length,
  });
}
