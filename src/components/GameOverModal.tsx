import React from 'react';
import { Trophy, RotateCcw, Wrench, Flame, Zap, Compass, DollarSign } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  summary: {
    finalScore: number;
    distanceMeters: number;
    maxSpeedKmh: number;
    nearMisses: number;
    coinsEarned: number;
  };
  isHighScore: boolean;
  totalCoins: number;
  onRestart: () => void;
  onGoToGarage: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  isHighScore,
  totalCoins,
  onRestart,
  onGoToGarage,
  onGoToMenu,
}) => {
  return (
    <div id="game-over-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md select-none text-white font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 mb-3">
          <Flame className="w-8 h-8 text-zinc-950" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
          Major Collision!
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Your high-speed highway run has ended.</p>

        {/* High Score Celebration Banner */}
        {isHighScore && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-extrabold text-xs flex items-center gap-2 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NEW ALL-TIME HIGH SCORE!</span>
          </div>
        )}

        {/* Final Score Hero */}
        <div className="my-5 w-full bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total Run Score</span>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums mt-1">
            {summary.finalScore.toLocaleString()}
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 text-left">
            <Compass className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Distance</div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                {(summary.distanceMeters / 1000).toFixed(2)} km
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 text-left">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Top Speed</div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                {summary.maxSpeedKmh} km/h
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 text-left">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Near Misses</div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                {summary.nearMisses}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800 flex items-center gap-3 text-left">
            <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Coins Earned</div>
              <div className="text-sm sm:text-base font-bold text-amber-400 tabular-nums">
                +{summary.coinsEarned}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            id="gameover-restart-btn"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:brightness-110 active:scale-[0.98] transition font-black text-lg text-zinc-950 uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Race Again</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="gameover-garage-btn"
              onClick={() => {
                sound.playClick();
                onGoToGarage();
              }}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition font-bold text-sm text-white flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Garage</span>
            </button>

            <button
              id="gameover-menu-btn"
              onClick={() => {
                sound.playClick();
                onGoToMenu();
              }}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] transition font-bold text-sm text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700 cursor-pointer"
            >
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
