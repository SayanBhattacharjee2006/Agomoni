'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayer } from '@/features/player/PlayerContext';
import PlaylistItem from './PlaylistItem';

interface PlaylistPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const skeletonPlaceholders = [1, 2, 3, 4, 5];

/**
 * PlaylistPanel — Overlay drawer sliding in from the left.
 *
 * Requirements:
 * - Decoupled from state.error (playback/YouTube errors) to prevent player error 150
 *   from overriding the playlist song list.
 * - Uses state.playlistError to check for fetch-related errors.
 * - Stays in DOM, slides via CSS transform, overlays background cleanly.
 */
export default function PlaylistPanel({ isOpen, onClose }: PlaylistPanelProps) {
  const { state, selectSong } = usePlayer();
  const activeItemRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the active song when panel opens
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300); // wait for slide transition
      return () => clearTimeout(timer);
    }
  }, [isOpen, state.currentIndex]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay — covers background, independent of main elements */}
      <div
        className={`fixed inset-0 z-[25] transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel — Slides overlay from left side */}
      <div
        ref={panelRef}
        className={`fixed left-0 top-0 bottom-0 z-[35] flex flex-col overflow-hidden transition-transform duration-300 ease-out
          /* Responsive overlay drawer width */
          w-[85%] sm:w-[360px] 
          /* Visual styling */
          bg-[rgba(20,12,8,0.94)] backdrop-blur-xl
          border-r border-[rgba(212,175,55,0.15)]
          shadow-[5px_0_30px_rgba(0,0,0,0.5)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-label="গানের তালিকা"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(212,175,55,0.18)] shrink-0">
          <h2 className="text-[#FFF8E7] font-medium text-lg font-bengali">গানের তালিকা</h2>
          <button
            onClick={onClose}
            className="text-[#FFF8E7]/70 hover:text-[#FFF8E7] transition-colors p-1.5 rounded-md hover:bg-white/5"
            aria-label="Close playlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar pb-28 pt-2"
        >
          {state.isLoading ? (
            <div className="py-2">
              {skeletonPlaceholders.map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                  <div className="w-10 h-10 rounded-sm bg-[rgba(255,248,231,0.08)] shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-[rgba(255,248,231,0.08)] mb-2" />
                    <div className="h-2 w-1/2 rounded bg-[rgba(255,248,231,0.06)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : state.playlistError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-[#C0392B] text-sm mb-3 font-bengali">{state.playlistError}</p>
              <p className="text-[#FFF8E7]/40 text-xs">প্লেলিস্ট লোড করা যায়নি</p>
            </div>
          ) : state.playlist.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[#FFF8E7]/50 px-6 text-center">
              <p className="font-bengali">গানের তালিকা খালি</p>
            </div>
          ) : (
            <div className="py-1">
              {state.playlist.map((song, index) => {
                const isActive = index === state.currentIndex && !state.isMahalaya;
                return (
                  <div key={song.id} ref={isActive ? activeItemRef : null}>
                    <PlaylistItem
                      song={song}
                      index={index}
                      isActive={isActive}
                      isPlaying={state.isPlaying}
                      onSelect={selectSong}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export { PlaylistPanel };
