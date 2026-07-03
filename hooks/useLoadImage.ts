import { Song } from "@/types";

const BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export const useLoadImage = (song: Song) => {
  if (!song?.image_path) return null;

  // If already a full URL, return it
  if (song.image_path.startsWith("http")) {
    return song.image_path;
  }

  // Build the full URL using R2 base URL
  return `${BASE}/${song.image_path}`;
};
