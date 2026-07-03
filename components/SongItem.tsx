"use client";

import Link from "next/link";
import { Song } from "@/types";
import { PlayButton } from "./PlayButton";
import { useLoadImage } from "@/hooks/useLoadImage";
import LazyImg from "@/components/LazyImg";

interface SongItemProps {
  data: Song & {
    slug?: string | null;
    artist_slug?: string | null;
  };
  onClick: (id: string) => void;
}

export const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  const href =
    data.slug && data.artist_slug ? `/${data.artist_slug}/${data.slug}` : null;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(data.id);
  };

  const Card = () => (
    <div
      className="
        relative group flex flex-col overflow-hidden
        cursor-pointer rounded-md
        bg-transparent hover:bg-neutral-400/10 transition
        p-1.5
      "
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md">
        {/* Using <img> + IntersectionObserver lazy loading (works in your custom scroll container) */}
        <LazyImg
          src={imagePath || "/images/liked.png"}
          alt="Image"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute bottom-2 right-2" onClick={handlePlayClick}>
          <PlayButton />
        </div>
      </div>

      <div className="flex flex-col items-start w-full pt-2 gap-y-0.5">
        <p className="w-full truncate text-sm font-semibold">{data.title}</p>

        <p className="w-full truncate text-xs text-neutral-400 pb-1">
          By{" "}
          {data.artist_id ? (
            <Link
              href={`/artist/${data.artist_id}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {data.author}
            </Link>
          ) : (
            data.author
          )}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card />
      </Link>
    );
  }

  return (
    <div onClick={() => onClick(data.id)}>
      <Card />
    </div>
  );
};
