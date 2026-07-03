"use client";

import { useEffect, useState } from "react";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";
import { getRandomSongs } from "@/actions/getRandomSongs";

type Props = {
  initialCount?: number; // how many songs are already shown above
};

export default function RandomSongInfiniteList({ initialCount = 0 }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onPlay = useOnPlay([...songs]); // list used for play queue

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    // page is offset by initialCount so you don't repeat the first 12
    const next = await getRandomSongs(page + Math.ceil(initialCount / 20));

    if (!next.length) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setSongs((prev) => [...prev, ...next]);
    setPage((prev) => prev + 1);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  });

  return (
    <div
      className="
        mt-4
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
        <SongItem
          key={song.id}
          data={song}
          onClick={() => onPlay(song.id)}
        />
      ))}

      {isLoading && (
        <p className="text-neutral-400 text-sm col-span-full">
          Loading...
        </p>
      )}

      {!hasMore && !isLoading && songs.length > 0 && (
        <p className="text-neutral-400 text-sm col-span-full">
          No more songs to load.
        </p>
      )}
    </div>
  );
}
