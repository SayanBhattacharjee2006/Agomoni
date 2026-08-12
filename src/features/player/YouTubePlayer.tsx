'use client';

import { useEffect, useRef } from 'react';
import { usePlayer, MAHALAYA_VIDEO_ID } from './PlayerContext';

/**
 * YouTubePlayer — Hidden YouTube IFrame that handles actual audio playback.
 *
 * Requirements:
 * - Decouples state.error from playlist view.
 * - Gracefully catches embedding errors (like 101/150) and displays a clean localized
 *   message in the player console before auto-skipping.
 * - Cleans up skip timers if users click next/prev during the error state.
 */
export function YouTubePlayer() {
  const { state, dispatch, playerRef } = usePlayer();

  // Refs to access latest state inside callbacks without re-creating the YT player
  const stateRef = useRef(state);
  stateRef.current = state;

  // Track the last loaded video ID to avoid redundant loads
  const lastLoadedIdRef = useRef<string | null>(null);

  // Store ref for the error auto-skip timer to clear it if user manually navigates
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize YouTube IFrame API — only once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      playerRef.current = new window.YT.Player('youtube-player', {
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            const s = stateRef.current;
            event.target.setVolume(s.volume);
            if (s.isMuted) {
              event.target.mute();
            }
            dispatch({ type: 'SET_LOADING', payload: false });
          },
          onStateChange: (event) => {
            const ytState = event.data;
            const s = stateRef.current;

            if (ytState === 1) {
              // PLAYING
              dispatch({ type: 'SET_LOADING', payload: false });
              dispatch({ type: 'PLAY' });
              const dur = event.target.getDuration();
              if (dur > 0) {
                dispatch({ type: 'SET_DURATION', payload: dur });
              }
            } else if (ytState === 2) {
              // PAUSED
              dispatch({ type: 'SET_LOADING', payload: false });
              dispatch({ type: 'PAUSE' });
            } else if (ytState === 0) {
              // ENDED
              if (s.repeat) {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                dispatch({ type: 'NEXT' });
              }
            } else if (ytState === 3) {
              // BUFFERING
              dispatch({ type: 'SET_LOADING', payload: true });
            } else if (ytState === 5) {
              // CUED
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          },
          onError: (event) => {
            const errCode = event.data;
            let errorMsg = 'প্লেব্যাক ত্রুটি হয়েছে।';

            if (errCode === 101 || errCode === 150) {
              errorMsg = 'এই গানটি এখানে বাজানোর অনুমতি নেই (এম্বেড করা সম্ভব নয়)।';
            } else if (errCode === 100) {
              errorMsg = 'গানটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।';
            } else if (errCode === 2) {
              errorMsg = 'ইউটিউব আইডি অবৈধ।';
            }

            dispatch({ type: 'SET_ERROR', payload: errorMsg });
            dispatch({ type: 'SET_LOADING', payload: false });

            // Clear any active skip timer before setting a new one
            if (errorTimeoutRef.current) {
              clearTimeout(errorTimeoutRef.current);
            }

            // Skip to next track after 3 seconds
            errorTimeoutRef.current = setTimeout(() => {
              dispatch({ type: 'NEXT' });
            }, 3000);
          },
        },
      });
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine active video ID
  const getActiveVideoId = (): string | null => {
    if (state.isMahalaya) {
      return MAHALAYA_VIDEO_ID || null;
    }
    if (state.playlist.length === 0) {
      return null;
    }
    const currentSong = state.playlist[state.currentIndex];
    return currentSong ? currentSong.id : null;
  };

  const activeVideoId = getActiveVideoId();

  // Load video on activeVideoId change
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.loadVideoById !== 'function') return;
    if (!activeVideoId) return;

    // Clear any pending error-skip timer if the active video changes (e.g. user skipped manually)
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    // Skip if we already loaded this video
    if (lastLoadedIdRef.current === activeVideoId) return;
    lastLoadedIdRef.current = activeVideoId;

    if (state.isPlaying) {
      player.loadVideoById(activeVideoId);
    } else {
      player.cueVideoById(activeVideoId);
    }
  }, [activeVideoId, state.isPlaying, playerRef]);

  // Sync play/pause changes
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.playVideo !== 'function') return;
    if (!activeVideoId) return;

    if (state.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [state.isPlaying, activeVideoId, playerRef]);

  // Sync volume and mute
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.setVolume !== 'function') return;

    player.setVolume(state.volume);
    if (state.isMuted) {
      player.mute();
    } else {
      player.unMute();
    }
  }, [state.volume, state.isMuted, playerRef]);

  // Poll progress timer
  useEffect(() => {
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (player && typeof player.getCurrentTime === 'function') {
        dispatch({ type: 'SET_CURRENT_TIME', payload: player.getCurrentTime() });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [state.isPlaying, dispatch, playerRef]);

  return (
    <div
      id="youtube-player"
      style={{
        width: '1px',
        height: '1px',
        opacity: 0,
        position: 'absolute',
        pointerEvents: 'none',
      }}
    />
  );
}
export default YouTubePlayer;
