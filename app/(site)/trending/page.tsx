"use client";

import { Header } from "@/components/Header";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import SongCard from "@/components/SongCard";
import { Song } from "@/types";

export default function TrendingPage() {
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">Trending songs</h1>
      </Header>

      <div className="px-6 py-6">
        <InfiniteGrid<Song>
          fetchUrl="/api/trending"
          renderItem={(song, all) => (
            <SongCard song={song} queueIds={all.map((s) => s.id)} />
          )}
        />
      </div>
    </div>
  );
}
