// app/playlist/[id]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getPlaylistWithSongs } from '@/actions/getPlaylistWithSongs';
import { PageContent } from '@/components/PageContent';

type Params = { params: { id: string } };

export const revalidate = 0;

export default async function PlaylistPage({ params }: Params) {
  const playlist = await getPlaylistWithSongs(params.id);
  if (!playlist) return notFound();

  const img = playlist.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${playlist.image_path}`
    : '/images/liked.png';

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      {/* Hero header */}
      <div className="relative w-full">
        <div className="px-6 pt-6 pb-8 flex gap-6 items-end bg-gradient-to-b from-emerald-700/70 to-neutral-900">
          <div className="relative h-40 w-40 rounded-md overflow-hidden shadow-xl">
            <Image src={img} alt={playlist.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutral-300">Public Playlist</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white">{playlist.name}</h1>
            {playlist.description ? (
              <p className="text-neutral-300 mt-2">{playlist.description}</p>
            ) : null}
            <p className="text-neutral-400 text-sm mt-1">
              {playlist.songs.length} songs
            </p>
          </div>
        </div>
      </div>

      {/* Songs list */}
      <div className="px-6 py-6">
        <PageContent songs={playlist.songs} />
      </div>
    </div>
  );
}
