'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NowPlaying } from './NowPlaying';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { Shuffle, Repeat, AlertTriangle } from 'lucide-react';
import { usePlayer } from './PlayerContext';

/**
 * MusicPlayerBar — Centered, floating, highly translucent music console.
 *
 * Positioning:
 * - Desktop: fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-120px)] max-w-[1000px]
 * - Mobile: fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)]
 *
 * Style:
 * - Transparent/highly translucent background: bg-[rgba(20,12,8,0.45)] with backdrop-blur-md.
 * - Shows playback error banner locally above controls if state.error is present.
 */
export default function MusicPlayerBar() {
  const { state, dispatch } = usePlayer();
  const hasPlaylist = state.playlist.length > 0 || state.isMahalaya;

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const toggleRepeat = () => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  };

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed z-40 select-none
        /* Centered floating coordinates */
        bottom-4 md:bottom-6 left-1/2 -translate-x-1/2
        w-[calc(100%-32px)] md:w-[calc(100%-120px)] max-w-[1000px]
        /* Highly translucent heritage glass style */
        bg-[rgba(10,5,2,0.55)] backdrop-blur-[4px]
        border border-[rgba(212,175,55,0.12)]
        rounded-xl
        shadow-[0_10px_35px_rgba(0,0,0,0.55)]"
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

        {/* Right (cols 9-12) — Volume & Shufflers */}
        <div className="col-span-3 flex items-center justify-end gap-3 lg:gap-4">
          <div className="flex items-center gap-1">
            {/* Shuffle Toggle */}
            <button
              onClick={toggleShuffle}
              disabled={!hasPlaylist || state.isMahalaya}
              aria-label="Shuffle playlist"
              className={`p-2 rounded-md hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                state.shuffle ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/60 hover:text-[#FFF8E7]'
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
              className={`p-2 rounded-md hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                state.repeat ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/60 hover:text-[#FFF8E7]'
              }`}
              title={state.repeat ? 'Repeat On' : 'Repeat Off'}
            >
              <Repeat size={18} />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[rgba(212,175,55,0.2)]" />

          <VolumeControl />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col md:hidden py-3 px-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <NowPlaying />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <PlayerControls />
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
              className={`p-1.5 rounded hover:bg-white/5 ${state.repeat ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/50'}`}
            >
              <Repeat size={15} />
            </button>
            <button
              onClick={toggleShuffle}
              disabled={!hasPlaylist || state.isMahalaya}
              className={`p-1.5 rounded hover:bg-white/5 ${state.shuffle ? 'text-[#D4AF37]' : 'text-[#FFF8E7]/50'}`}
            >
              <Shuffle size={15} />
            </button>
            <VolumeControl />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export { MusicPlayerBar };
