import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Beat, BeatPackTrack } from '../types';
import { recordPlayEvent } from '../services/api';

export type PlayableTrack = {
  id: string;
  title: string;
  producer?: string;
  artworkUrl?: string;
  audioUrl: string;
  bpm?: number;
  key?: string;
  price?: number;
  isFree?: boolean;
  genre?: string;
  format?: string;
  originalBeat?: Beat;
};

interface AudioContextType {
  currentTrack: PlayableTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  audioError: string | null;
  favorites: string[];
  toggleFavorite: (beatId: string) => void;
  isFavorite: (beatId: string) => boolean;
  playTrack: (track: PlayableTrack, queue?: PlayableTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  queue: PlayableTrack[];
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [queue, setQueue] = useState<PlayableTrack[]>([]);

  // Persistent Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cashmere_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cashmere_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites]);

  const toggleFavorite = (beatId: string) => {
    setFavorites(prev => 
      prev.includes(beatId) ? prev.filter(id => id !== beatId) : [...prev, beatId]
    );
  };

  const isFavorite = (beatId: string) => favorites.includes(beatId);

  // ONE authoritative native HTMLAudioElement instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      const err = audio.error;
      let errorMsg = 'Failed to load audio stream.';
      if (err) {
        if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          errorMsg = 'Audio source format or stream URL is not supported or missing.';
        } else if (err.code === MediaError.MEDIA_ERR_NETWORK) {
          errorMsg = 'Network error while streaming audio.';
        } else if (err.code === MediaError.MEDIA_ERR_DECODE) {
          errorMsg = 'Audio file corruption or decoding error.';
        }
      }
      setAudioError(errorMsg);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playTrack = (track: PlayableTrack, newQueue?: PlayableTrack[]) => {
    if (!audioRef.current) return;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }

    setAudioError(null);

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    setIsLoading(true);

    const audio = audioRef.current;
    audio.pause();
    audio.src = track.audioUrl;
    audio.currentTime = 0;

    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
      if (track.originalBeat?.id) {
        recordPlayEvent(track.originalBeat.id);
      }
    }).catch((err) => {
      console.error('Play error:', err);
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError(`Audio stream error: ${err.message || 'Unable to play file'}`);
    });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        setAudioError(`Playback error: ${err.message}`);
      });
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const nextTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    }
  };

  const prevTrack = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isLoading,
      audioError,
      favorites,
      toggleFavorite,
      isFavorite,
      playTrack,
      togglePlay,
      pause,
      seek,
      setVolume,
      toggleMute,
      nextTrack,
      prevTrack,
      queue
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
