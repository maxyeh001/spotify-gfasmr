"use client";

import { useEffect, useState } from "react";
import SongCard from "@/components/SongCard";
import { Header } from "@/components/Header";
import { Song } from "@/types";

export default function SongPageClient({
  artist,
  song,
}: {
  artist: any;
  song: Song;
}) {
  const [queueIds, setQueueIds] = useState<string[]>([song.id]);

  // Optional: bump view count when someone lands here
  useEffect(() => {
    fetch(`/api/songs/${song.id}/view`, { method: "POST" }).catch(() => {});
  }, [song.id]);

  // Shared song links start with only one song locally. Hydrate a same-artist
  // queue so the player next button has fresh tracks to move to.
  useEffect(() => {
    if (!song.artist_id) {
      setQueueIds([song.id]);
      return;
    }

    const params = new URLSearchParams({
      artistId: song.artist_id,
      songId: song.id,
      title: song.title ?? "",
    });

    fetch(`/api/queue/for-song?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const ids: string[] = Array.isArray(json?.queueIds) ? json.queueIds : [];
        setQueueIds(ids.length ? ids : [song.id]);
      })
      .catch(() => setQueueIds([song.id]));
  }, [song.id, song.artist_id, song.title]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">{song.title}</h1>
        <p className="text-neutral-400 mt-1">{artist.name}</p>
      </Header>

      <div className="px-6 py-6 max-w-[520px]">
        <SongCard song={song} queueIds={queueIds} />
      </div>
    </div>
  );
}
