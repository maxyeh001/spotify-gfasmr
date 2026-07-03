import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { getArtist } from "@/actions/getArtist"; // by id
import { getArtistBySlug } from "@/actions/getArtistBySlug"; // by slug
import { getArtistSongs } from "@/actions/getArtistSongs";
import { ArtistSongsSection } from "@/components/ArtistSongsSection";

type Params = { params: { slug: string } };

export const revalidate = 0;

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

// If you store supabase storage paths like "artists/xxx.png", this converts to a public URL
const imgUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // NOTE: This assumes you have a public bucket called "images"
  // and your paths are stored relative to that bucket
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
};

export default async function ArtistPage({ params }: Params) {
  const raw = params.slug;

  // 1) If /artist/<uuid>, load by id and redirect to /artist/<slug>
  if (isUuid(raw)) {
    const byId = await getArtist(raw);
    if (!byId) return notFound();

    if (byId.slug) redirect(`/artist/${byId.slug}`);

    // If no slug exists, we can still render the page by id
    const { popular, others } = await getArtistSongs(byId.id);

    const hero = imgUrl(byId.hero_path) ?? "/images/liked.png";
    const avatar = imgUrl(byId.avatar_path) ?? "/images/liked.png";

    return (
      <div className="w-full">
        {/* HERO */}
        <div className="relative w-full h-[260px]">
          <Image
            src={hero}
            alt={`${byId.name} hero`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden">
              <Image src={avatar} alt={byId.name} fill className="object-cover" />
            </div>
            <h1 className="text-white text-4xl font-bold">{byId.name}</h1>
          </div>
        </div>

        <ArtistSongsSection artist={byId} popular={popular} others={others} />
      </div>
    );
  }

  // 2) Normal: /artist/<slug>
  const artist = await getArtistBySlug(raw);
  if (!artist) return notFound();

  // IMPORTANT: getArtistSongs expects artist UUID
  const { popular, others } = await getArtistSongs(artist.id);

  const hero = imgUrl(artist.hero_path) ?? "/images/liked.png";
  const avatar = imgUrl(artist.avatar_path) ?? "/images/liked.png";

  return (
    <div className="w-full">
      {/* HERO */}
      <div className="relative w-full h-[260px]">
        <Image
          src={hero}
          alt={`${artist.name} hero`}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden">
            <Image src={avatar} alt={artist.name} fill className="object-cover" />
          </div>
          <h1 className="text-white text-4xl font-bold">{artist.name}</h1>
        </div>
      </div>

      <ArtistSongsSection artist={artist} popular={popular} others={others} />
    </div>
  );
}
