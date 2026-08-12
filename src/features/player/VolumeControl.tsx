'use client';

import { usePlayer } from './PlayerContext';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

export function VolumeControl() {
  const { state, dispatch } = usePlayer();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    dispatch({ type: 'SET_VOLUME', payload: vol });
    if (state.isMuted && vol > 0) {
      dispatch({ type: 'TOGGLE_MUTE' });
    }
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const VolumeIcon = state.isMuted || state.volume === 0
    ? VolumeX
    : state.volume < 50
    ? Volume1
    : Volume2;

  return (
    <div className="flex items-center space-x-2 md:space-x-3 w-auto flex-1 justify-end min-w-[60px] md:min-w-[120px]">
      <button
        onClick={toggleMute}
        aria-label={state.isMuted ? 'Unmute' : 'Mute'}
        className="text-[#FFF8E7]/70 hover:text-[#FFF8E7] transition-colors"
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      <div className="hidden md:flex relative w-20 lg:w-24 h-1.5 group cursor-pointer items-center">
        <input
          type="range"
          min={0}
          max={100}
          value={state.isMuted ? 0 : state.volume}
          onChange={handleVolumeChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Volume"
        />
        <div className="absolute left-0 right-0 h-1.5 bg-[#FFF8E7]/15 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 bottom-0 bg-[#FFF8E7] transition-all duration-100 ease-linear"
            style={{ width: `${state.isMuted ? 0 : state.volume}%` }}
          />
        </div>
      </div>
    </div>
  );
}
