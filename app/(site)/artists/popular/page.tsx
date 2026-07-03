"use client";

import { Header } from "@/components/Header";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import { ArtistCard } from "@/components/ArtistCard";

type Artist = {
  id: string;
  name: string;
  avatar_path?: string | null;
};

export default function PopularArtistsPage() {
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">Popular artists</h1>
      </Header>

      <div className="px-6 py-6">
        <InfiniteGrid<Artist>
          fetchUrl="/api/popular-artists"
          renderItem={(artist) => <ArtistCard artist={artist} />}
        />
      </div>
    </div>
  );
}
