'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { NowPlaying } from './NowPlaying';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { Shuffle, Repeat, AlertTriangle, ChevronDown, ChevronUp, Play, Pause, Loader2 } from 'lucide-react';
import { usePlayer, MAHALAYA_SONG } from './PlayerContext';

/**
 * MusicPlayerBar — Collapsible floating glass music console.
 *
 * Features:
 * - ~95% transparent background (bg-[rgba(10,5,2,0.07)]) with subtle backdrop blur & gold border.
 * - Collapsible layout: shrinks into a floating mini-player at bottom-right corner.
 * - Restores full player when expanded without interrupting playback.
 * - Responsive layout for mobile and desktop.
 */
export default function MusicPlayerBar() {
  const { state, dispatch, togglePlay } = usePlayer();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasPlaylist = state.playlist.length > 0 || state.isMahalaya;
  const currentSong = state.isMahalaya ? MAHALAYA_SONG : state.playlist[state.currentIndex];

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        /* Collapsed Floating Mini-Player (Bottom-Right) */
        <motion.div
          key="collapsed-player"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed z-40 select-none
            bottom-4 right-4 md:bottom-6 md:right-8
            flex items-center gap-3 px-3.5 py-2.5
            /* ~95% transparent dark glass background */
            bg-[rgba(10,5,2,0.08)] backdrop-blur-[5px]
            border border-[rgba(212,175,55,0.25)]
            rounded-xl
            shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          {/* Small Artwork / Icon */}
          <div className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 border border-[rgba(212,175,55,0.2)] rounded-sm overflow-hidden bg-[#FFF8E7]/10 flex items-center justify-center">
            {currentSong ? (
              <Image
                src={currentSong.thumbnail}
                alt={currentSong.title}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <span className="text-xs">📻</span>
            )}
          </div>

          {/* Short Title & Artist */}
          <div className="flex flex-col min-w-0 max-w-[110px] sm:max-w-[140px]">
            <span className="text-[#FFF8E7] text-xs font-medium truncate font-bengali">
              {currentSong ? currentSong.title : 'আগমনী Radio'}
            </span>
            <span className="text-[#FFF8E7]/60 text-[10px] truncate font-bengali">
              {currentSong ? currentSong.artist : 'মা আসছেন'}
            </span>
          </div>

          {/* Compact Play / Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!hasPlaylist}
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF8E7]/15 hover:bg-[#FFF8E7]/30 text-[#FFF8E7] transition-all border border-[rgba(212,175,55,0.3)] disabled:opacity-50 shrink-0"
          >
            {state.isLoading && hasPlaylist ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : state.isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Expand Button */}
          <button
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand player"
            title="সম্প্রসারিত করুন"
            className="p-1.5 rounded-md text-[#FFF8E7]/70 hover:text-[#D4AF37] hover:bg-white/10 transition-colors shrink-0"
          >
            <ChevronUp size={18} />
          </button>
        </motion.div>
      ) : (
        /* Full Floating Console Player (~95% Transparent) */
        <motion.div
          key="full-player"
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed z-40 select-none
            /* Centered floating coordinates */
            bottom-4 md:bottom-6 left-1/2 -translate-x-1/2
            w-[calc(100%-32px)] md:w-[calc(100%-120px)] max-w-[1000px]
            /* ~95% transparent dark glass style */
            bg-[rgba(10,5,2,0.07)] backdrop-blur-[4px]
            border border-[rgba(212,175,55,0.18)]
            rounded-xl
            shadow-[0_10px_35px_rgba(0,0,0,0.45)]"
        >
          {/* Playback Error Banner — Displays locally inside player area */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full bg-[rgba(192,57,43,0.9)] border-b border-[rgba(212,175,55,0.15)] rounded-t-xl overflow-hidden px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-[#FFF8E7] font-bengali text-center"
              >
                <AlertTriangle size={13} className="text-[#FFF8E7]" />
                <span>{state.error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-12 items-center px-6 h-28 gap-4">
            {/* Left (cols 1-3) — Now Playing */}
            <div className="col-span-3 min-w-0">
              <NowPlaying />
            </div>

            {/* Center (cols 4-8) — Controls & Progress */}
            <div className="col-span-6 flex flex-col items-center justify-center px-4 w-full">
              <PlayerControls />
              <ProgressBar />
            </div>

            {/* Right (cols 9-12) — Volume, Shufflers & Collapse button */}
            <div className="col-span-3 flex items-center justify-end gap-3 lg:gap-4">
              <div className="flex items-center gap-1">
                {/* Shuffle Toggle */}
                <button
                  onClick={toggleShuffle}
                  disabled={!hasPlaylist || state.isMahalaya}
                  aria-label="Shuffle playlist"
                  className={`p-2 rounded-md hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    state.shuffle ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/70 hover:text-[#FFF8E7]'
                  }`}
                  title={state.shuffle ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <Shuffle size={18} />
                </button>

                {/* Repeat Toggle */}
                <button
                  onClick={toggleRepeat}
                  disabled={!hasPlaylist}
                  aria-label="Repeat track"
                  className={`p-2 rounded-md hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    state.repeat ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/70 hover:text-[#FFF8E7]'
                  }`}
                  title={state.repeat ? 'Repeat On' : 'Repeat Off'}
                >
                  <Repeat size={18} />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[rgba(212,175,55,0.2)]" />

              <VolumeControl />

              {/* Collapse Button (Far Right) */}
              <button
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse player"
                title="সংকুচিত করুন"
                className="p-2 rounded-md text-[#FFF8E7]/70 hover:text-[#D4AF37] hover:bg-white/10 transition-colors shrink-0 ml-1"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden py-3 px-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <NowPlaying />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PlayerControls />
                {/* Mobile Collapse Button */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse player"
                  title="সংকুচিত করুন"
                  className="p-1.5 rounded-md text-[#FFF8E7]/70 hover:text-[#D4AF37] hover:bg-white/10 transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <ProgressBar />
              </div>

              {/* Quick Repeat/Shuffle/Volume on mobile */}
              <div className="flex items-center gap-1 text-[#FFF8E7]/80">
                <button
                  onClick={toggleRepeat}
                  disabled={!hasPlaylist}
                  className={`p-1.5 rounded hover:bg-white/10 ${state.repeat ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/60'}`}
                >
                  <Repeat size={15} />
                </button>
                <button
                  onClick={toggleShuffle}
                  disabled={!hasPlaylist || state.isMahalaya}
                  className={`p-1.5 rounded hover:bg-white/10 ${state.shuffle ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/60'}`}
                >
                  <Shuffle size={15} />
                </button>
                <VolumeControl />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { MusicPlayerBar };
