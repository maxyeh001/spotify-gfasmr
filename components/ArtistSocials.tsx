'use client';

import { Artist } from '@/types';
import { FiExternalLink } from 'react-icons/fi';

type Props = {
  artist: Artist;
};

const clean = (url?: string | null) => (url && url.trim().length ? url.trim() : null);

const SocialLink = ({ label, href }: { label: string; href: string }) => {
  // Ensure protocol so it opens correctly
  const finalHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 transition text-sm"
    >
      <span className="text-neutral-100">{label}</span>
      <FiExternalLink className="text-neutral-400" />
    </a>
  );
};

export const ArtistSocials: React.FC<Props> = ({ artist }) => {
  const instagram = clean(artist.instagram_url);
  const twitter = clean(artist.twitter_url);
  const redditProfile = clean(artist.reddit_profile_url);
  const subreddit = clean(artist.subreddit_url);

  const hasAny = !!(instagram || twitter || redditProfile || subreddit);

  return (
    <aside className="w-full">
      <div className="rounded-lg bg-neutral-900/40 border border-neutral-800 p-4">
        <h3 className="text-white text-lg font-semibold">Socials</h3>

        {!hasAny ? (
          <p className="text-neutral-400 text-sm mt-2">
            No socials have been added for this artist yet.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {instagram && <SocialLink label="Instagram" href={instagram} />}
            {twitter && <SocialLink label="Twitter / X" href={twitter} />}
            {redditProfile && <SocialLink label="Reddit profile" href={redditProfile} />}
            {subreddit && <SocialLink label="Subreddit" href={subreddit} />}
          </div>
        )}
      </div>
    </aside>
  );
};
