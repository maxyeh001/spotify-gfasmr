"use client";

import { useEffect, useRef, useState } from "react";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";

type Props = {
  initialSongs: Song[]; // this will now be ~100
};

const STEP = 12; // how many new tiles to reveal each time

export default function PopularSongsGrid({ initialSongs }: Props) {
  const [visibleCount, setVisibleCount] = useState(STEP);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const songsToShow = initialSongs.slice(0, visibleCount);
  const onPlay = useOnPlay(songsToShow);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        setVisibleCount((prev) => {
          if (prev >= initialSongs.length) return prev;
          return Math.min(prev + STEP, initialSongs.length);
        });
      },
      {
        root: null,
        rootMargin: "600px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [initialSongs.length]);

  if (!initialSongs?.length) {
    return <div className="text-neutral-400 px-6 py-10">No songs found.</div>;
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {songsToShow.map((song) => (
          <SongItem key={song.id} data={song} onClick={() => onPlay(song.id)} />
        ))}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-10" />

      {visibleCount < initialSongs.length ? (
        <p className="text-neutral-400 text-sm px-6 py-4">Loading more...</p>
      ) : (
        <p className="text-neutral-400 text-sm px-6 py-4">You’re all caught up.</p>
      )}
    </>
  );
}
