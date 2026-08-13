'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PlayerProvider } from '@/features/player/PlayerContext';
import { GlobalMusicPlayer } from '@/features/player/GlobalMusicPlayer';
import BackgroundScene from '@/components/BackgroundScene';
import AgomoniHeader from '@/components/AgomoniHeader';
import LoadingState from '@/components/LoadingState';
import PlaylistToggle from '@/features/playlist/PlaylistToggle';
import PlaylistPanel from '@/features/playlist/PlaylistPanel';
import { usePlaylist } from '@/hooks/usePlaylist';

/**
 * Inner content component — must be inside PlayerProvider
 * so usePlaylist() can dispatch to the player context.
 */
function AgomoniContent() {
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const { isLoading } = usePlaylist();

  return (
    <>
      {/* Full-screen Durga Puja background */}
      <BackgroundScene />

      {/* Loading overlay — shows while playlist is being fetched */}
      <AnimatePresence>
        {isLoading && <LoadingState />}
      </AnimatePresence>

      {/* Top header with branding & responsive navigation */}
      <AgomoniHeader onTogglePlaylist={() => setIsPlaylistOpen((prev) => !prev)} />

      {/* Main content area — mostly empty to let the background shine */}
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Spacer — pushes content below the header */}
        <div className="flex-1" />
      </main>

      {/* Floating playlist toggle stack (Desktop only) */}
      <PlaylistToggle
        isOpen={isPlaylistOpen}
        onToggle={() => setIsPlaylistOpen((prev) => !prev)}
      />

      {/* Expandable playlist panel */}
      <PlaylistPanel
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
      />

      {/* Global persistent music player (bottom bar + hidden YouTube iframe) */}
      <GlobalMusicPlayer />
    </>
  );
}

/**
 * Home — The single-page Agomoni experience.
 *
 * Wraps everything in PlayerProvider so the global player state
 * is available to all child components.
 */
export default function Home() {
  return (
    <PlayerProvider>
      <AgomoniContent />
    </PlayerProvider>
  );
}
