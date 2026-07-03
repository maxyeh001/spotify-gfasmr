'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCheck, FaEllipsisH, FaLink, FaPlay, FaShareAlt } from 'react-icons/fa';

import { Song } from '@/types';
import { useOnPlay } from '@/hooks/useOnPlay';
import { useLoadImage } from '@/hooks/useLoadImage';
import LazyImg from '@/components/LazyImg';

type Props = {
  songs: Song[];
  variant?: 'popular' | 'all';
  showHeader?: boolean;
  artistSlug?: string | null;
};

const formatDuration = (seconds?: number | null) => {
  if (seconds == null || !isFinite(seconds)) return '–:–';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const getSongShareUrl = (song: Song, artistSlug?: string | null) => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;

  if (artistSlug && song.slug) {
    return `${origin}/${artistSlug}/${song.slug}`;
  }

  return `${origin}/artist/${artistSlug ?? song.artist_id ?? ''}?song=${song.id}`;
};

const ShareMenu: React.FC<{
  song: Song;
  artistSlug?: string | null;
}> = ({ song, artistSlug }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const copyLink = async () => {
    const url = getSongShareUrl(song, artistSlug);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareSong = async () => {
    const url = getSongShareUrl(song, artistSlug);

    if (navigator.share) {
      await navigator.share({
        title: song.title,
        text: `Listen to ${song.title} by ${song.author}`,
        url,
      });
      setOpen(false);
      return;
    }

    await copyLink();
  };

  return (
    <div ref={menuRef} className="relative flex justify-end">
      <button
        type="button"
        aria-label={`Share ${song.title}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="rounded-full p-2 text-neutral-400 opacity-100 hover:bg-white/10 hover:text-white focus:opacity-100 focus:outline-none md:opacity-0 md:group-hover:opacity-100"
      >
        <FaEllipsisH className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={shareSong}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
          >
            <FaShareAlt className="h-3.5 w-3.5" />
            Share song
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
          >
            {copied ? <FaCheck className="h-3.5 w-3.5" /> : <FaLink className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
};

const TrackRow: React.FC<{
  song: Song;
  index: number;
  cols: string;
  onPlay: (id: string) => void;
  artistSlug?: string | null;
}> = ({ song, index, cols, onPlay, artistSlug }) => {
  const imagePath = useLoadImage(song);

  return (
    <div
      className={
        `group grid ${cols} items-center gap-3 rounded-md px-3 py-2 text-left ` +
        `hover:bg-white/10 focus-within:bg-white/10`
      }
    >
      <button
        type="button"
        onClick={() => onPlay(song.id)}
        className="pl-1 text-left text-sm text-neutral-400 focus:outline-none"
        aria-label={`Play ${song.title}`}
      >
        <span className="group-hover:hidden">{index + 1}</span>
        <span className="hidden group-hover:inline-flex items-center justify-center">
          <FaPlay className="h-3 w-3 text-white" />
        </span>
      </button>

      <button
        type="button"
        onClick={() => onPlay(song.id)}
        className="flex min-w-0 items-center gap-3 text-left focus:outline-none"
      >
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
          <LazyImg
            src={imagePath || '/images/liked.png'}
            alt={song.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-white">{song.title}</div>
          <div className="truncate text-xs text-neutral-400">{song.author}</div>
        </div>
      </button>

      <span className="text-right text-sm tabular-nums text-neutral-400">
        {formatDuration(song.duration_seconds)}
      </span>

      <ShareMenu song={song} artistSlug={artistSlug} />
    </div>
  );
};

export const TrackTable: React.FC<Props> = ({
  songs,
  variant = 'all',
  showHeader = true,
  artistSlug,
}) => {
  const onPlay = useOnPlay(songs);

  const cols = useMemo(() => 'grid-cols-[40px_1fr_56px_40px]', []);

  return (
    <div className="w-full">
      {showHeader && (
        <div
          className={
            `hidden md:grid ${cols} border-b border-neutral-800 px-3 py-2 text-xs text-neutral-400`
          }
        >
          <span className="pl-1">#</span>
          <span>Title</span>
          <span className="text-right">⏱</span>
          <span aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-col">
        {songs.map((song, i) => (
          <TrackRow
            key={song.id}
            song={song}
            index={i}
            cols={cols}
            onPlay={onPlay}
            artistSlug={artistSlug}
          />
        ))}
      </div>
    </div>
  );
};
