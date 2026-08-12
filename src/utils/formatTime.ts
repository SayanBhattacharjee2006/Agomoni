/**
 * Converts seconds to "M:SS" or "H:MM:SS" format.
 * @param seconds The number of seconds.
 * @returns Formatted time string.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const paddedS = s.toString().padStart(2, '0');
  
  if (h > 0) {
    const paddedM = m.toString().padStart(2, '0');
    return `${h}:${paddedM}:${paddedS}`;
  }
  
  return `${m}:${paddedS}`;
}

/**
 * Converts YouTube ISO 8601 duration (e.g. PT4M32S) to readable format.
 * @param duration The ISO 8601 duration string.
 * @returns Formatted time string.
 */
export function parseISO8601Duration(duration: string): string {
  if (!duration) return '0:00';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  return formatTime(totalSeconds);
}
