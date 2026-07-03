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

  // 1) pinned first
  const { data: pinnedRows, error: pinnedErr } = await supabase
    .from("pinned_popular_artists")
    .select("position, artists(*)")
    .order("position", { ascending: true });

  if (pinnedErr) {
    return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
  }

  const pinned = (pinnedRows ?? [])
    .map((r: any) => r.artists)
    .filter(Boolean);

  const pinnedIds = pinned.map((a: any) => a.id).filter((id: any) => id != null);
  const pinnedCount = pinned.length;

  // 2) slice pinned for this page
  const pinnedStart = Math.min(offset, pinnedCount);
  const pinnedEnd = Math.min(offset + limit, pinnedCount);
  const pinnedSlice = pinned.slice(pinnedStart, pinnedEnd);

  // 3) fill remaining from artists table (excluding pinned)
  const remaining = Math.max(0, limit - pinnedSlice.length);
  const restOffset = Math.max(0, offset - pinnedCount);

  let restItems: any[] = [];
  if (remaining > 0) {
    let q = supabase
      .from("artists")
      .select("*")
      .order("created_at", { ascending: false });

    if (pinnedIds.length > 0) {
      q = q.not("id", "in", `(${pinnedIds.join(",")})`);
    }

    const { data: rest, error: restErr } = await q.range(
      restOffset,
      restOffset + remaining - 1
    );

    if (restErr) {
      return NextResponse.json({ error: restErr.message }, { status: 500 });
    }

    restItems = rest ?? [];
  }

  const items = [...pinnedSlice, ...restItems];

  return NextResponse.json({
    items,
    nextOffset: offset + items.length,
  });
}
