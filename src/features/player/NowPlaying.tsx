'use client';

import { usePlayer, MAHALAYA_SONG } from './PlayerContext';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

export function NowPlaying() {
  const { state } = usePlayer();
  const currentSong = state.isMahalaya ? MAHALAYA_SONG : state.playlist[state.currentIndex];

  return (
    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1 select-none">
      <AnimatePresence mode="wait">
        {currentSong ? (
          <motion.div
            key={currentSong.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-3 md:space-x-4 min-w-0"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 border border-[rgba(212,175,55,0.2)] rounded-sm overflow-hidden">
              <Image
                src={currentSong.thumbnail}
                alt={currentSong.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40px, 48px"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[#FFF8E7] text-sm md:text-base font-medium truncate max-w-[150px] md:max-w-[200px] font-bengali">
                {currentSong.title}
              </span>
              <span className="text-[#FFF8E7]/70 text-xs md:text-sm truncate max-w-[150px] md:max-w-[200px] font-bengali">
                {currentSong.artist}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFF8E7]/10 rounded-sm shrink-0 flex items-center justify-center border border-[rgba(212,175,55,0.15)]">
              <span className="text-[#FFF8E7]/30 text-xs">📻</span>
            </div>
            <div className="ml-3 md:ml-4">
              <span className="text-[#FFF8E7] font-medium font-bengali">আগমনী Radio</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
