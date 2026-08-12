'use client';

import { YouTubePlayer } from './YouTubePlayer';
import { MusicPlayerBar } from './MusicPlayerBar';

export function GlobalMusicPlayer() {
  return (
    <>
      <YouTubePlayer />
      <MusicPlayerBar />
    </>
  );
}
