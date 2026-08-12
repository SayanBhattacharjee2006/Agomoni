'use client';

import { usePlayer } from './PlayerContext';
import { formatTime } from '@/utils/formatTime';

export function ProgressBar() {
  const { state, dispatch, playerRef } = usePlayer();
  const hasPlaylist = state.playlist.length > 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(time, true);
    }
  };

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className="flex items-center w-full max-w-md md:max-w-xl mx-auto space-x-2 md:space-x-3 mt-1 md:mt-2">
      <span className="text-[10px] md:text-xs text-[#FFF8E7]/70 w-8 md:w-10 text-right">
        {formatTime(state.currentTime)}
      </span>
      
      <div className="relative flex-1 h-1 md:h-1.5 group cursor-pointer flex items-center">
        <input
          type="range"
          min={0}
          max={state.duration || 100}
          value={state.currentTime}
          onChange={handleSeek}
          disabled={!hasPlaylist || state.duration === 0}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          aria-label="Seek progress"
        />
        <div className="absolute left-0 right-0 h-1 md:h-1.5 bg-[#FFF8E7]/15 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 bottom-0 bg-[#D4AF37] transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div 
          className="absolute h-2.5 w-2.5 md:h-3 md:w-3 bg-[#FFF8E7] rounded-full shadow transition-all duration-100 ease-linear scale-0 group-hover:scale-100"
          style={{ left: `calc(${progressPercent}% - 4px)` }}
        />
      </div>

      <span className="text-[10px] md:text-xs text-[#FFF8E7]/70 w-8 md:w-10">
        {formatTime(state.duration)}
      </span>
    </div>
  );
}
