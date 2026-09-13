import React from 'react';
import { Play, RotateCcw, Wrench, Home, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGoToGarage: () => void;
  onGoToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGoToGarage,
  onGoToMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div id="pause-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md select-none text-white font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-6">
          Game Paused
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            id="pause-resume-btn"
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:brightness-110 active:scale-[0.98] transition font-black text-base text-zinc-950 uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-zinc-950" />
            <span>Resume Race</span>
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition font-bold text-sm text-white flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Race</span>
          </button>

          <button
            id="pause-garage-btn"
            onClick={() => {
              sound.playClick();
              onGoToGarage();
            }}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition font-bold text-sm text-white flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Garage</span>
          </button>

          <button
            id="pause-menu-btn"
            onClick={() => {
              sound.playClick();
              onGoToMenu();
            }}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition font-bold text-sm text-zinc-300 hover:text-white flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>

          <button
            id="pause-mute-btn"
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="w-full py-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-2 border border-zinc-800 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Sound: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
