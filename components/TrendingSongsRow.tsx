"use client";

import HorizontalRow from "@/components/HorizontalRow";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";
import { Song } from "@/types";

type Props = {
  songs: Song[];
};

export default function TrendingSongsRow({ songs }: Props) {
  const onPlay = useOnPlay(songs);

  return (
    <HorizontalRow>
      {songs.map((song) => (
        <div key={song.id} className="w-[152px] shrink-0">
          <SongItem data={song} onClick={() => onPlay(song.id)} />
        </div>
      ))}
    </HorizontalRow>
  );
}
