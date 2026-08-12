'use client';

import { motion } from 'framer-motion';
import { ListMusic, X } from 'lucide-react';
import { usePlayer } from '@/features/player/PlayerContext';

interface PlaylistToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const glowVariants = {
  playing: {
    boxShadow: [
      '0 0 0 0 rgba(212, 175, 55, 0)',
      '0 0 12px 2px rgba(212, 175, 55, 0.25)',
      '0 0 0 0 rgba(212, 175, 55, 0)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  idle: { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
};

/**
 * PlaylistToggle — Small vertical floating toggle button placed on the left side,
 * positioned elegantly below the Agomoni header (around top-48 left-8).
 */
export default function PlaylistToggle({ isOpen, onToggle }: PlaylistToggleProps) {
  const { state } = usePlayer();

  return (
    <div className="fixed left-4 sm:left-6 md:left-8 top-40 sm:top-44 md:top-48 z-[30] flex flex-col items-center gap-1.5 select-none">
      {/* Small [ ♪ ] Button */}
      <motion.button
        onClick={onToggle}
        className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-lg bg-[rgba(20,12,8,0.7)] backdrop-blur-md border border-[rgba(212,175,55,0.2)] flex items-center justify-center hover:bg-[rgba(20,12,8,0.85)] hover:border-[rgba(212,175,55,0.35)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
        variants={glowVariants}
        animate={state.isPlaying ? 'playing' : 'idle'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close playlist' : 'Toggle playlist'}
        title="গানের তালিকা"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {isOpen ? (
            <X className="w-5 h-5 md:w-6 md:h-6 text-[#FFF8E7]" />
          ) : (
            <ListMusic className="w-5 h-5 md:w-6 md:h-6 text-[#FFF8E7]" />
          )}
        </motion.div>
      </motion.button>

      {/* Playlist Label */}
      <span className="font-bengali text-[10px] md:text-xs text-[#FFF8E7]/70 tracking-wide font-medium">
        প্লেলিস্ট
      </span>
    </div>
  );
}
export { PlaylistToggle };
