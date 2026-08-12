export interface Song {
  id: string;           // YouTube video ID
  title: string;
  thumbnail: string;    // URL to thumbnail
  artist: string;       // Channel name
  position: number;     // Position in playlist
  duration: string;     // Formatted duration like "4:32"
}

export interface PlayerState {
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;       // 0-100
  isMuted: boolean;
  currentTime: number;  // seconds
  duration: number;     // seconds
  error: string | null;         // For YouTube playback errors
  playlistError: string | null; // Specifically for playlist metadata loading errors
  shuffle: boolean;
  repeat: boolean;
  isMahalaya: boolean;
}

export type PlayerAction =
  | { type: 'SET_PLAYLIST'; payload: Song[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAYLIST_ERROR'; payload: string | null }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'PLAY_MAHALAYA' }
  | { type: 'EXIT_MAHALAYA' };
