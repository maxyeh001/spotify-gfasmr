// components/PageContent.tsx
'use client';

import { Song } from '@/types';
import { useOnPlay } from '@/hooks/useOnPlay';
import { SongItem } from '@/components/SongItem';

type Props = {
  songs: Song[];
};

export const PageContent: React.FC<Props> = ({ songs }) => {
  // Pass the full song objects, not just IDs
  const onPlay = useOnPlay(songs);

  if (!songs?.length) {
    return (
      <div className="text-neutral-400 px-6 py-10">
        No songs found.
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
        2xl:grid-cols-7
        gap-4
      "
    >
      {songs.map((song) => (
        <SongItem key={song.id} data={song} onClick={(id) => onPlay(id)} />
      ))}
    </div>
  );
};
