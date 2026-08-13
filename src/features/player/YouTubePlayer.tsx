'use client';

import { useEffect, useRef } from 'react';
import { usePlayer, MAHALAYA_VIDEO_ID } from './PlayerContext';
import { PlayerState } from '@/types/player';

/**
 * YouTubePlayer — Hidden YouTube IFrame that handles actual audio playback.
 *
 * Re-designed state machine for transition/intent tracking:
 * - Prevents loading transitions from corrupting state.isPlaying.
 * - Tracks user playback intent in playIntentRef.
 * - Ignores stale YouTube events from previously skipped videos to avoid race conditions.
 * - Correctly toggles loading spinner during buffering/loading states.
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

  // Playback intent: stores if the user wants music to actively play
  const playIntentRef = useRef<boolean>(state.isPlaying);

  // Transition state: true during loading/cueing of a new track
  const isTransitioningRef = useRef<boolean>(false);

  // Helper to extract current video ID from state
  const getCurrentTrackId = (s: PlayerState): string | null => {
    if (s.isMahalaya) {
      return MAHALAYA_VIDEO_ID || null;
    }
    if (s.playlist.length === 0) {
      return null;
    }
    const currentSong = s.playlist[s.currentIndex];
    return currentSong ? currentSong.id : null;
  };

  // Helper to verify if the event matches the current track ID to avoid race conditions
  const isEventForCurrentTrack = (event: any): boolean => {
    const currentTrackId = getCurrentTrackId(stateRef.current);
    if (!currentTrackId) return false;

    let playerVideoId = '';
    if (event.target && typeof event.target.getVideoUrl === 'function') {
      const url = event.target.getVideoUrl();
      const match = url.match(/[?&]v=([^&#]+)/);
      playerVideoId = match ? match[1] : '';
    }
    if (!playerVideoId && typeof event.target.getVideoData === 'function') {
      const data = event.target.getVideoData();
      playerVideoId = data ? data.video_id : '';
    }

    // If we can't extract it, fall back to true (process it anyway) but usually we can
    return !playerVideoId || playerVideoId === currentTrackId;
  };

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
            if (!isEventForCurrentTrack(event)) {
              return; // Ignore callbacks from stale/skipped videos
            }

            const ytState = event.data;
            const s = stateRef.current;

            if (ytState === window.YT.PlayerState.PLAYING) {
              // PLAYING (1)
              isTransitioningRef.current = false;
              dispatch({ type: 'SET_LOADING', payload: false });
              dispatch({ type: 'PLAY' });
              const dur = event.target.getDuration();
              if (dur > 0) {
                dispatch({ type: 'SET_DURATION', payload: dur });
              }
            } else if (ytState === window.YT.PlayerState.PAUSED) {
              // PAUSED (2)
              // Only dispatch PAUSE to React state if we are NOT in the middle of a video transition
              if (!isTransitioningRef.current) {
                dispatch({ type: 'SET_LOADING', payload: false });
                dispatch({ type: 'PAUSE' });
              }
            } else if (ytState === window.YT.PlayerState.ENDED) {
              // ENDED (0)
              isTransitioningRef.current = false;
              if (s.repeat) {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                dispatch({ type: 'NEXT' });
              }
            } else if (ytState === window.YT.PlayerState.BUFFERING) {
              // BUFFERING (3)
              dispatch({ type: 'SET_LOADING', payload: true });
            } else if (ytState === window.YT.PlayerState.CUED) {
              // CUED (5)
              // The video has finished loading and is ready. We can now complete the transition.
              isTransitioningRef.current = false;
              dispatch({ type: 'SET_LOADING', payload: false });

              // Apply the play/pause intent captured before the transition
              if (playIntentRef.current) {
                event.target.playVideo();
              } else {
                // If intent was paused, make sure context state is set to paused
                dispatch({ type: 'PAUSE' });
              }
            }
          },
          onError: (event) => {
            if (!isEventForCurrentTrack(event)) return;

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

  const activeVideoId = getCurrentTrackId(state);

  // Sync state.isPlaying changes (e.g. user manually clicked play/pause)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.playVideo !== 'function') return;
    if (!activeVideoId) return;

    // Synchronize play intent with the user's manual action
    playIntentRef.current = state.isPlaying;

    // Do not sync if the player is currently transitioning/loading
    if (isTransitioningRef.current) return;

    if (state.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [state.isPlaying, activeVideoId, playerRef]);

  // Load video on activeVideoId change (i.e. user skipped or selected another track)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof player.cueVideoById !== 'function') return;
    if (!activeVideoId) return;

    // Clear error timers
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    // Skip if we already loaded this video
    if (lastLoadedIdRef.current === activeVideoId) return;
    lastLoadedIdRef.current = activeVideoId;

    // Capture playback state before changing track to preserve playback intent
    playIntentRef.current = stateRef.current.isPlaying;

    // Set transition state to true so intermediate state changes are ignored
    isTransitioningRef.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    // Always cue the video first to prevent autostart race conditions.
    // When the cued video is ready, the CUED event handler will play it if playIntentRef is true.
    player.cueVideoById(activeVideoId);
  }, [activeVideoId, playerRef, dispatch]);

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
