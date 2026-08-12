'use client';

import { usePlayer } from './PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PlayerControls() {
  const { state, dispatch, togglePlay } = usePlayer();
  const hasPlaylist = state.playlist.length > 0 || state.isMahalaya;

  const handlePrevious = () => {
    dispatch({ type: 'PREVIOUS' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT' });
  };

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-6">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!hasPlaylist}
        aria-label="Previous song"
        className="text-[#FFF8E7] hover:text-[#D4AF37] disabled:text-[#FFF8E7]/30 transition-colors disabled:cursor-not-allowed p-1.5 rounded-md hover:bg-white/5"
      >
        <SkipBack className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
      </button>

      {/* Play/Pause Button */}
      <motion.button
        whileTap={hasPlaylist ? { scale: 0.93 } : {}}
        onClick={togglePlay}
        disabled={!hasPlaylist}
        aria-label={state.isPlaying ? 'Pause' : 'Play'}
        className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FFF8E7]/10 hover:bg-[#FFF8E7]/25 text-[#FFF8E7] border border-[rgba(212,175,55,0.25)] hover:border-[rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(212,175,55,0.1)]"
      >
        {state.isLoading && hasPlaylist ? (
          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
        ) : state.isPlaying ? (
          <Pause className="w-5 h-5 md:w-6 md:h-6 text-[#FFF8E7]" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 md:w-6 md:h-6 text-[#FFF8E7] ml-1" fill="currentColor" />
        )}
      </motion.button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasPlaylist}
        aria-label="Next song"
        className="text-[#FFF8E7] hover:text-[#D4AF37] disabled:text-[#FFF8E7]/30 transition-colors disabled:cursor-not-allowed p-1.5 rounded-md hover:bg-white/5"
      >
        <SkipForward className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
      </button>
    </div>
  );
}
