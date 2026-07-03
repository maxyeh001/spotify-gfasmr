import { Header } from "@/components/Header";

import { getTrendingSongs } from "@/actions/getTrendingSongs";
import { getPopularArtists } from "@/actions/getPopularArtists";
import { getPopularSongs } from "@/actions/getPopularSongs";

import TrendingSongsRow from "@/components/TrendingSongsRow";
import PopularArtistsRow from "@/components/PopularArtistsRow";
import PopularSongsGridStatic from "@/components/PopularSongsGridStatic";

export const revalidate = 0;

// Limits for homepage
const TRENDING_LIMIT = 20;
const ARTISTS_LIMIT = 20;

// ~5 rows on desktop (6 columns × 5 rows)
const POPULAR_SONGS_LIMIT = 36;

export default async function Home() {
  const [trendingAll, popularArtistsAll, popularSongs] = await Promise.all([
    getTrendingSongs(),
    getPopularArtists(),
    getPopularSongs(POPULAR_SONGS_LIMIT),
  ]);

  const trending = trendingAll.slice(0, TRENDING_LIMIT);
  const popularArtists = popularArtistsAll.slice(0, ARTISTS_LIMIT);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="h-2" />
      </Header>

      {/* TRENDING SONGS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Trending Audios</h2>
          <a
            href="/trending"
            className="text-neutral-400 hover:text-white text-sm"
          >
            Show all
          </a>
        </div>

        <TrendingSongsRow songs={trending} />
      </section>

      {/* POPULAR ARTISTS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Popular Artists</h2>
          <a
            href="/artists/popular"
            className="text-neutral-400 hover:text-white text-sm"
          >
            Show all
          </a>
        </div>

        <PopularArtistsRow artists={popularArtists} />
      </section>

      {/* POPULAR SONGS */}
      <section className="px-6 mb-10">
        <h2 className="text-white text-xl font-semibold">Popular Audios</h2>

        <PopularSongsGridStatic songs={popularSongs} />
      </section>
    </div>
  );
}
