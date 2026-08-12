import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@/features/player/PlayerContext';
import { Song } from '@/types/player';

export function usePlaylist() {
  const { dispatch } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/playlist');
      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }
      const data = await response.json();
      const playlist: Song[] = data.playlist ?? [];
      setSongs(playlist);
      dispatch({ type: 'SET_PLAYLIST', payload: playlist });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      dispatch({ type: 'SET_PLAYLIST_ERROR', payload: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchPlaylist();
    }
  }, [fetchPlaylist]);

  return { songs, isLoading, error, refetch: fetchPlaylist };
}
