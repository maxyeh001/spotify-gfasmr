"use client";

import { useEffect, useRef, useState } from "react";

type Props<T> = {
  fetchUrl: string; // e.g. /api/trending
  renderItem: (item: T, allItems: T[]) => React.ReactNode;
};

export function InfiniteGrid<T>({ fetchUrl, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = async () => {
    if (loading || done) return;
    setLoading(true);

    try {
      const res = await fetch(`${fetchUrl}?limit=24&offset=${offset}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Failed to fetch");

      const newItems: T[] = json.items ?? [];
      const nextOffset: number = json.nextOffset ?? offset + newItems.length;

      setItems((prev) => [...prev, ...newItems]);
      setOffset(nextOffset);

      if (newItems.length === 0) setDone(true);
    } catch (e) {
      console.error(e);
      // stop trying forever if something is wrong
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "600px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, offset, done, loading]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {items.map((it, idx) => (
          <div key={idx}>{renderItem(it, items)}</div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {loading && <div className="text-neutral-400 text-sm mt-4">Loading…</div>}
      {done && items.length > 0 && (
        <div className="text-neutral-500 text-sm mt-4">That’s everything.</div>
      )}
    </>
  );
}
