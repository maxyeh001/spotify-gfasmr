export const useLoadArtistImage = (path?: string | null) => {
  if (!path) return null;

  // already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // R2 public base (set this in env)
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

  // fallback: return path as-is if base missing
  if (!base) return path;

  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};
