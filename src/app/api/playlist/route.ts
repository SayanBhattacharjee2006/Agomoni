import { NextResponse } from 'next/server';
import { playlistCache } from '@/lib/youtube/cache';
import { fetchPlaylistItems } from '@/lib/youtube/playlist';
import { Song } from '@/types/player';

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

  if (!apiKey || !playlistId) {
    return NextResponse.json(
      { error: 'Missing YouTube API Key or Playlist ID in environment variables' },
      { status: 500 }
    );
  }

  try {
    const cachedPlaylist = playlistCache.get<Song[]>(playlistId);
    
    if (cachedPlaylist) {
      const response = NextResponse.json({ playlist: cachedPlaylist });
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
      return response;
    }

    const playlist = await fetchPlaylistItems(playlistId, apiKey);
    
    playlistCache.set(playlistId, playlist, 600000); // 10 minutes

    const response = NextResponse.json({ playlist });
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}
