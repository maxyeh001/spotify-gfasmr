"use client";

import Link from "next/link";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";

interface Props {
  songs: Song[];
}

export default function PopularSongsGridStatic({ songs }: Props) {
  const onPlay = useOnPlay(songs);

  return (
    <div className="mt-4">
      {/* SONG GRID (fixed tile width = same as TrendingSongsRow) */}
      <div
        className="
          grid
          justify-start
          gap-x-6
          gap-y-6
          [grid-template-columns:repeat(auto-fill,minmax(152px,152px))]
        "
      >
        {songs.map((song) => (
          <div key={song.id} className="w-[152px] shrink-0">
            <SongItem data={song} onClick={() => onPlay(song.id)} />
          </div>
        ))}
      </div>

      {/* SHOW ALL BUTTON (centered) */}
      <div className="flex justify-center mt-8">
        <Link
          href="/songs/popular"
          className="
            px-6 py-2 rounded-full
            border border-neutral-600
            text-sm text-neutral-300
            hover:text-white hover:border-white
            transition
          "
        >
          Show all
        </Link>
      </div>
    </div>
  );
}
