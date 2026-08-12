'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, type ReactNode } from 'react';
import { PlayerState, PlayerAction, Song } from '@/types/player';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
  namespace YT {
    interface Player {
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      setVolume(volume: number): void;
      getVolume(): number;
      mute(): void;
      unMute(): void;
      isMuted(): boolean;
      getCurrentTime(): number;
      getDuration(): number;
      getPlayerState(): number;
      loadVideoById(videoId: string): void;
      cueVideoById(videoId: string): void;
      destroy(): void;
    }
    interface PlayerEvent {
      target: Player;
      data: number;
    }
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }
    interface PlayerOptions {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
        onError?: (event: PlayerEvent) => void;
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions);
    }
  }
}

// Configurable Mahalaya YouTube video ID — reads from env with fallback undefined
export const MAHALAYA_VIDEO_ID = process.env.NEXT_PUBLIC_MAHALAYA_VIDEO_ID;

export const MAHALAYA_SONG: Song = {
  id: MAHALAYA_VIDEO_ID || '',
  title: 'মহিষাসুরমর্দিনী (মহালয়া)',
  artist: 'বীরেন্দ্রকৃষ্ণ ভদ্র',
  thumbnail: '/generated_dp2.png',
  position: 0,
  duration: '1:29:45',
};

const initialState: PlayerState = {
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  isLoading: true,
  volume: 75,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  error: null,
  playlistError: null,
  shuffle: false,
  repeat: false,
  isMahalaya: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload, playlistError: null };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload, currentTime: 0, duration: 0, isMahalaya: false, error: null };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(100, action.payload)) };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLAYLIST_ERROR':
      return { ...state, playlistError: action.payload };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'TOGGLE_REPEAT':
      return { ...state, repeat: !state.repeat };
    case 'PLAY_MAHALAYA':
      return { ...state, isMahalaya: true, isPlaying: true, currentTime: 0, duration: 0, error: null };
    case 'EXIT_MAHALAYA':
      return { ...state, isMahalaya: false, currentTime: 0, duration: 0, error: null };
    case 'NEXT': {
      if (state.isMahalaya) {
        return { ...state, isMahalaya: false, currentIndex: 0, currentTime: 0, duration: 0, error: null };
      }
      if (state.playlist.length === 0) return state;
      let nextIndex = state.currentIndex;
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length;
      }
      return { ...state, currentIndex: nextIndex, currentTime: 0, duration: 0, error: null };
    }
    case 'PREVIOUS': {
      if (state.isMahalaya) {
        return { ...state, isMahalaya: false, currentIndex: 0, currentTime: 0, duration: 0, error: null };
      }
      if (state.playlist.length === 0) return state;
      let prevIndex = state.currentIndex;
      if (state.shuffle) {
        prevIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
      }
      return { ...state, currentIndex: prevIndex, currentTime: 0, duration: 0, error: null };
    }
    default:
      return state;
  }
}

interface PlayerContextValue {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  selectSong: (index: number) => void;
  playSong: (index: number) => void;
  playMahalaya: () => void;
  togglePlay: () => void;
  playerRef: React.MutableRefObject<YT.Player | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef<YT.Player | null>(null);

  const selectSong = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
  }, []);

  const playSong = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
    dispatch({ type: 'PLAY' });
  }, []);

  const playMahalaya = useCallback(() => {
    if (!MAHALAYA_VIDEO_ID) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'মহালয়া ভিডিও আইডি সেট করা নেই। .env ফাইলে NEXT_PUBLIC_MAHALAYA_VIDEO_ID সেট করুন।' 
      });
      return;
    }
    dispatch({ type: 'PLAY_MAHALAYA' });
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'PLAY' });
    }
  }, [state.isPlaying]);

  return (
    <PlayerContext.Provider value={{ state, dispatch, selectSong, playSong, playMahalaya, togglePlay, playerRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
