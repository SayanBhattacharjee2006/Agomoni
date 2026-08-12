import { Song } from '@/types/player';
import { parseISO8601Duration } from '@/utils/formatTime';
import { YouTubePlaylistItemsResponse, YouTubeVideosResponse } from './types';

/**
 * Fetches all items from a YouTube playlist and their durations.
 * @param playlistId The ID of the YouTube playlist.
 * @param apiKey The YouTube Data API v3 key.
 * @returns A promise that resolves to an array of Song objects.
 */
export async function fetchPlaylistItems(playlistId: string, apiKey: string): Promise<Song[]> {
  try {
    let allItems: any[] = [];
    let nextPageToken: string | undefined = undefined;

    // 1. Fetch all playlist items (handling pagination)
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.append('part', 'snippet,contentDetails');
      url.searchParams.append('maxResults', '50');
      url.searchParams.append('playlistId', playlistId);
      url.searchParams.append('key', apiKey);
      if (nextPageToken) {
        url.searchParams.append('pageToken', nextPageToken);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist items: ${response.status} ${response.statusText}`);
      }

      const data: YouTubePlaylistItemsResponse = await response.json();
      allItems = allItems.concat(data.items);
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    // 2. Fetch video durations in batches of 50
    const videoIds = allItems.map(item => item.contentDetails.videoId);
    const videoDurations: Record<string, string> = {};

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.append('part', 'contentDetails');
      url.searchParams.append('id', batch.join(','));
      url.searchParams.append('key', apiKey);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
      }

      const data: YouTubeVideosResponse = await response.json();
      for (const item of data.items) {
        videoDurations[item.id] = item.contentDetails.duration;
      }
    }

    // 3. Map to Song[]
    return allItems.map(item => {
      const videoId = item.contentDetails.videoId;
      const durationISO = videoDurations[videoId] || 'PT0S';
      
      const thumbnails = item.snippet.thumbnails;
      const thumbnailUrl = thumbnails.maxres?.url || 
                           thumbnails.high?.url || 
                           thumbnails.medium?.url || 
                           thumbnails.default?.url || 
                           '';

      return {
        id: videoId,
        title: item.snippet.title,
        thumbnail: thumbnailUrl,
        artist: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
        position: item.snippet.position,
        duration: parseISO8601Duration(durationISO)
      };
    });

  } catch (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }
}
