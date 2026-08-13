'use client';

import { motion } from 'framer-motion';
import { ListMusic, X } from 'lucide-react';
import { usePlayer } from '@/features/player/PlayerContext';

interface PlaylistToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

function YoutubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
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
 * PlaylistToggle — Top-left floating control stack (Desktop only, hidden on mobile).
 * Contains:
 * 1. YouTube Playlist button (positioned above, opens YouTube playlist in new tab)
 * 2. Playlist toggle button (positioned below, toggles Agomoni playlist drawer)
 */
export default function PlaylistToggle({ isOpen, onToggle }: PlaylistToggleProps) {
  const { state } = usePlayer();

  return (
    <div className="hidden md:flex fixed left-6 md:left-8 top-36 md:top-40 z-[30] flex-col items-center gap-3 select-none">
      {/* Top — YouTube Playlist External Link Button */}
      <div className="flex flex-col items-center gap-1">
        <motion.a
          href="https://www.youtube.com/playlist?list=PLOjcTOzcuKqo"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-lg bg-[rgba(20,12,8,0.7)] backdrop-blur-md border border-[rgba(212,175,55,0.2)] flex items-center justify-center hover:bg-[rgba(20,12,8,0.85)] hover:border-[rgba(212,175,55,0.35)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open YouTube playlist"
          title="ইউটিউব প্লেলিস্ট খুলুন"
        >
          <YoutubeIcon className="w-5 h-5 md:w-6 md:h-6 text-[#FFF8E7] group-hover:text-[#FF0000] transition-colors" />
        </motion.a>
        <span className="font-bengali text-[10px] md:text-xs text-[#FFF8E7]/70 font-medium">
          ইউটিউব
        </span>
      </div>

      {/* Bottom — Playlist Toggle Button */}
      <div className="flex flex-col items-center gap-1">
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
        <span className="font-bengali text-[10px] md:text-xs text-[#FFF8E7]/70 font-medium">
          প্লেলিস্ট
        </span>
      </div>
    </div>
  );
}
export { PlaylistToggle };
