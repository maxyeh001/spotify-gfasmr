'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import useSound from 'use-sound';

import { Song } from '@/types';
import { usePlayer } from '@/hooks/usePlayer';

import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillBackward, AiFillStepForward } from 'react-icons/ai';
import { HiSpeakerXMark, HiSpeakerWave } from 'react-icons/hi2';
import { MdShuffle, MdRepeat, MdRepeatOne } from 'react-icons/md';

import { MediaItem } from './MediaItem';
import { LikeButton } from './LikeButton';
import { Slider } from './Slider';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

type RepeatMode = 'off' | 'all' | 'one';

export const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();

  // volume / playback
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // shuffle / repeat
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isFindingNextSong, setIsFindingNextSong] = useState(false);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  // ---------- helpers ----------
  const format = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  const cycleRepeat = () =>
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));

  const pickNextIndex = () => {
    if (player.ids.length === 0) return -1;
    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    if (shuffle && player.ids.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) idx = Math.floor(Math.random() * player.ids.length);
      return idx;
    }
    // normal sequential (wrap when repeat all)
    return (currentIndex + 1) % player.ids.length;
  };

  const pickPrevIndex = () => {
    if (player.ids.length === 0) return -1;
    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    if (shuffle && player.ids.length > 1) {
      let idx = currentIndex;
      while (idx === currentIndex) idx = Math.floor(Math.random() * player.ids.length);
      return idx;
    }
    return (currentIndex - 1 + player.ids.length) % player.ids.length;
  };

  const fetchSameArtistQueue = async (): Promise<string[] | null> => {
    if (!song.artist_id) return null;

    const params = new URLSearchParams({
      artistId: song.artist_id,
      songId: song.id,
      title: song.title ?? '',
    });

    const response = await fetch(`/api/queue/for-song?${params.toString()}`);
    if (!response.ok) return null;

    const json = await response.json();
    const queueIds: string[] = Array.isArray(json?.queueIds) ? json.queueIds : [];
    return queueIds.length ? queueIds : null;
  };

  const onPlayNextSong = async () => {
    if (isFindingNextSong) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const queueIsEmptyOrSingle = player.ids.length <= 1;
    const queueIsAtEnd =
      repeatMode !== 'all' && currentIndex >= 0 && currentIndex === player.ids.length - 1;

    if (queueIsEmptyOrSingle || queueIsAtEnd) {
      try {
        setIsFindingNextSong(true);
        const queueIds = await fetchSameArtistQueue();
        const nextId = queueIds?.find((id) => id !== song.id);

        if (queueIds && nextId) {
          player.setIds(queueIds);
          player.setId(nextId);
          return;
        }
      } catch (error) {
        console.error('Unable to load same-artist queue', error);
      } finally {
        setIsFindingNextSong(false);
      }
    }

    const nextIndex = pickNextIndex();
    if (nextIndex >= 0) player.setId(player.ids[nextIndex]);
  };

  const onPlayPreviousSong = () => {
    const prevIndex = pickPrevIndex();
    if (prevIndex >= 0) player.setId(player.ids[prevIndex]);
  };

  // ---------- howler ----------
  const [play, { pause, sound }] = useSound(songUrl, {
  volume,
  html5: true,              // important for mobile

  format: ['mp3'],

  onplay: () => setIsPlaying(true),
  onpause: () => setIsPlaying(false),
  onend: () => {
    setIsPlaying(false);
    if (repeatMode === 'one') {
      // replay same track
      sound?.seek(0);
      sound?.play();
      return;
    }
    void onPlayNextSong();
  },

  // optional: log any mobile errors so we can see them
  onloaderror: (_id: string | null, err: any) => {
    console.error('Audio load error', err);
  },
  onplayerror: (_id: string | null, err: any) => {
    console.error('Audio play error', err);
  },
  });




  


  // autoplay + cleanup
  useEffect(() => {
    sound?.play();
    return () => {
      sound?.unload();
    };
  }, [sound]);

  // read duration + tick current time
  useEffect(() => {
    if (!sound) return;

    const setDur = () => {
      const d = sound.duration();
      if (typeof d === 'number' && isFinite(d)) setDuration(d);
    };
    setDur();
    // @ts-ignore howler types
    sound.on('load', setDur);

    const id = setInterval(() => {
      try {
        const t = sound.seek() as number;
        if (typeof t === 'number') setCurrentTime(t);
      } catch {
        /* ignore while loading */
      }
    }, 250);

    return () => {
      clearInterval(id);
      // @ts-ignore
      sound.off('load', setDur);
    };
  }, [sound]);

  // reset progress when track changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [songUrl]);

  // ui handlers
  const handlePlay = () => (isPlaying ? pause() : play());
  const toggleMute = () => setVolume((v) => (v === 0 ? 1 : 0));
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (sound) sound.seek(t);
    setCurrentTime(t);
  };

  // which repeat icon to show
  const RepeatIcon = repeatMode === 'one' ? MdRepeatOne : MdRepeat;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      {/* Left: artwork/title/like */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Center: transport + compact progress (kept centered) */}
      <div className="hidden md:flex h-full justify-center items-center w-full px-4">
        <div className="flex flex-col items-center w-full">
          {/* transport row */}
          <div className="flex items-center gap-5 mb-2">
            <MdShuffle
              size={22}
              onClick={() => setShuffle((s) => !s)}
              className={`cursor-pointer ${shuffle ? 'text-green-500' : 'text-neutral-400 hover:text-white'} transition`}
              title="Shuffle"
            />
            <AiFillBackward
              onClick={onPlayPreviousSong}
              size={28}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
              title="Previous"
            />
            <div
              onClick={handlePlay}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <Icon size={30} className="text-black" />
            </div>
            <AiFillStepForward
              onClick={() => void onPlayNextSong()}
              size={28}
              className="text-neutral-400 cursor-pointer hover:text-white transition"
              title="Next"
            />
            <RepeatIcon
              size={22}
              onClick={cycleRepeat}
              className={`cursor-pointer ${repeatMode !== 'off' ? 'text-green-500' : 'text-neutral-400 hover:text-white'} transition`}
              title={repeatMode === 'off' ? 'Repeat Off' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}
            />
          </div>

          {/* progress row (centered + shortened) */}
          <div className="flex items-center gap-3 w-full max-w-[520px]">
            <span className="text-xs text-neutral-400 w-10 text-right">{format(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-green-500"
            />
            <span className="text-xs text-neutral-400 w-10">{format(duration)}</span>
          </div>
        </div>
      </div>

      {/* Right: volume */}
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={34} />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>

      {/* Mobile: center play only (transport still available) */}
      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>
    </div>
  );
};
