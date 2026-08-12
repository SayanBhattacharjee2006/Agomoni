'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Song } from '@/types/player';

interface PlaylistItemProps {
  song: Song;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  isPlaying?: boolean;
}

const barVariants = {
  animate: (i: number) => ({
    height: [4, 12 + i * 4, 6, 14 - i * 2, 4],
    transition: {
      duration: 0.8 + i * 0.2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
  paused: { height: 4 },
};

export default function PlaylistItem({ song, index, isActive, onSelect, isPlaying = true }: PlaylistItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.title}`}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(index);
        }
      }}
      className={`group flex flex-row items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-200 outline-none focus-visible:bg-[rgba(255,248,231,0.05)] ${
        isActive
          ? 'border-l-2 border-[#D4AF37] bg-[rgba(212,175,55,0.08)]'
          : 'border-l-2 border-transparent hover:bg-[rgba(255,248,231,0.05)]'
      }`}
    >
      <div className="w-6 flex items-center justify-center shrink-0">
        {isActive ? (
          <div className="flex items-end gap-[2px] h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-[#D4AF37] rounded-full origin-bottom"
                custom={i}
                variants={barVariants}
                initial="paused"
                animate={isPlaying ? 'animate' : 'paused'}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-[#FFF8E7]/40 group-hover:text-[#FFF8E7]/60 transition-colors">
            {index + 1}
          </span>
        )}
      </div>

      <div className="relative w-10 h-10 rounded-sm overflow-hidden shrink-0">
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4
          className={`text-sm truncate transition-colors ${
            isActive ? 'text-[#D4AF37]' : 'text-[#FFF8E7]'
          }`}
        >
          {song.title}
        </h4>
        <p className="text-xs text-[#FFF8E7]/50 truncate">
          {song.artist}
        </p>
      </div>

      <div className="shrink-0">
        <span className="text-xs text-[#FFF8E7]/40 font-mono">
          {song.duration}
        </span>
      </div>
    </div>
  );
}
