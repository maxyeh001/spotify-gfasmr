"use client";

import HorizontalRow from "@/components/HorizontalRow";
import { ArtistCard } from "@/components/ArtistCard";

type Artist = {
  id: string;
  name: string;
  avatar_path?: string | null;
};

type Props = {
  artists: Artist[];
};

export default function PopularArtistsRow({ artists }: Props) {
  return (
    <HorizontalRow>
      {artists.map((artist) => (
        <div key={artist.id} className="w-[152px] shrink-0">
          <ArtistCard artist={artist} />
        </div>
      ))}
    </HorizontalRow>
  );
}
