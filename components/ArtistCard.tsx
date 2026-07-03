"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoadArtistImage } from "@/hooks/useLoadArtistImage";

type Artist = {
  id: string;
  name: string;
  slug?: string | null;
  avatar_path?: string | null;
};

export function ArtistCard({ artist }: { artist: Artist }) {
  const router = useRouter();
  const avatarUrl = useLoadArtistImage(artist.avatar_path);

  return (
    <div
      onClick={() => router.push(`/artist/${artist.slug ?? artist.id}`)}
      className="
        group cursor-pointer rounded-md bg-transparent
        hover:bg-neutral-400/10 transition
        p-1.5 flex flex-col gap-y-2
      "
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full max-w-[150px] mx-auto">
        <Image
          fill
          src={avatarUrl || "/images/liked.png"}
          alt={artist.name}
          className="object-cover"
          sizes="150px"
        />
      </div>

      <div className="flex flex-col gap-y-0.5">
        <p className="text-white font-semibold truncate text-sm">
          {artist.name}
        </p>
        <p className="text-neutral-400 text-xs">Artist</p>
      </div>
    </div>
  );
}
