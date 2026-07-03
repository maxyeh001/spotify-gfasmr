"use client";

import { useEffect } from "react";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { usePlayer } from "@/hooks/usePlayer";

type Props = {
  song: Song;
  queueIds?: string[]; // optional queue for “next/prev”
};

export default function SongCard({ song, queueIds }: Props) {
  const { activeId, setId, setIds } = usePlayer();

  // If the same-artist queue hydrates after the user already pressed play,
  // keep the active player's queue in sync so Next works immediately.
  useEffect(() => {
    if (activeId === song.id && queueIds?.length) {
      setIds(queueIds);
    }
  }, [activeId, queueIds, setIds, song.id]);

  return (
    <SongItem
      data={song}
      onClick={(id: string) => {
        setIds(queueIds ?? []);
        setId(id);
      }}
    />
  );
}
