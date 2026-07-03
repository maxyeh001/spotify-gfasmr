import { Song } from "@/types";

const BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export const useLoadSongUrl = (song: Song) => {
  if (!song?.song_path) return "";

  // If the CSV or DB already contains full URLs
  if (song.song_path.startsWith("http")) {
    return song.song_path;
  }

  // Build R2 public URL
  return `${BASE}/${song.song_path}`;
};
