// app/components/PlaylistCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  imagePath?: string | null;
  subtitle?: string | null;
};

export const PlaylistCard: React.FC<Props> = ({ id, name, imagePath, subtitle }) => {
  // build a public URL if you're storing just the object path
  const img =
    imagePath?.startsWith('http')
      ? imagePath
      : imagePath
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imagePath}`
      : '/images/liked.png'; // fallback you already have in repo

  return (
    <Link
      href={`/playlist/${id}`}
      className="
        group
        rounded-md
        bg-neutral-800/40
        hover:bg-neutral-800
        transition
        p-3
        flex
        flex-col
        gap-3
      "
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover"
          sizes="180px"
          priority={false}
        />
      </div>
      <div className="flex flex-col">
        <p className="text-white font-semibold truncate">{name}</p>
        {subtitle ? (
          <p className="text-neutral-400 text-sm truncate">{subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
};
