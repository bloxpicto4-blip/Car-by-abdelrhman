import React, { useState } from 'react';
import { PlayerSaveData, CarDefinition } from '../types';
import { CARS_CATALOG, computeEffectiveStats } from '../data/cars';
import { Play, Wrench, Trophy, HelpCircle, Volume2, VolumeX, Flame, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface MainMenuProps {
  playerData: PlayerSaveData;
  onStartRace: () => void;
  onOpenGarage: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerData,
  onStartRace,
  onOpenGarage,
  isMuted,
  onToggleMute,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const currentCar = CARS_CATALOG.find((c) => c.id === playerData.currentCarId) || CARS_CATALOG[0];
  const upgrades = playerData.carUpgrades[currentCar.id] || { speedLevel: 1, accelLevel: 1, handlingLevel: 1, brakingLevel: 1 };
  const effectiveStats = computeEffectiveStats(currentCar, upgrades);

  return (
    <div id="main-menu" className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-zinc-950/80 via-zinc-900/60 to-zinc-950/90 backdrop-blur-sm text-white select-none">
      {/* Top Header: Logo, Coins, and Sound Toggle */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Flame className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white uppercase italic">
              Traffic Racer <span className="text-amber-400">3D</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium tracking-wide">Endless Highway Arcade</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-lg">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-zinc-950 text-xs font-black shadow">
              $
            </div>
            <span className="font-black text-amber-400 tabular-nums text-lg">{playerData.coins.toLocaleString()}</span>
          </div>

          <button
            id="menu-mute-btn"
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Middle Center: High-impact Action Hero */}
      <div className="flex flex-col items-center justify-center max-w-xl mx-auto text-center my-auto w-full">
        {/* Selected Car Highlight */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Machine</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              {currentCar.category.toUpperCase()} CLASS
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white">{currentCar.name}</h3>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Top Speed </span>
              <span className="text-lg font-black text-emerald-400">{effectiveStats.topSpeed} <span className="text-xs font-semibold">km/h</span></span>
            </div>
          </div>
        </div>

        {/* Primary CTA: PLAY NOW */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            id="start-race-btn"
            onClick={() => {
              sound.playClick();
              onStartRace();
            }}
            className="group relative w-full py-4 sm:py-5 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-size-200 hover:bg-right transition-all duration-300 shadow-xl shadow-red-600/30 active:scale-[0.98] flex items-center justify-center gap-3 font-black text-xl sm:text-2xl uppercase tracking-wider text-zinc-950 font-sans cursor-pointer"
          >
            <Play className="w-7 h-7 fill-zinc-950" />
            <span>Race Highway</span>
          </button>

          {/* Secondary CTA: GARAGE */}
          <button
            id="open-garage-btn"
            onClick={() => {
              sound.playClick();
              onOpenGarage();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 active:scale-[0.98] transition flex items-center justify-center gap-2.5 font-bold text-base sm:text-lg text-white shadow-lg cursor-pointer"
          >
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Garage & Upgrades</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Records and Controls Guide */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-5xl mx-auto pt-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Best Score:</span>
            <span className="font-bold text-white tabular-nums">{playerData.highScore.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Best Distance:</span>
            <span className="font-bold text-white tabular-nums">
              {(playerData.bestDistanceMeters / 1000).toFixed(2)} km
            </span>
          </div>
        </div>

        <button
          id="help-toggle-btn"
          onClick={() => {
            sound.playClick();
            setShowHelp(!showHelp);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Controls & Gameplay</span>
        </button>
      </div>

      {/* Controls & Gameplay Modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              How to Play & Controls
            </h3>

            <div className="space-y-4 text-sm text-zinc-300">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-amber-400 mb-2 uppercase text-xs">Keyboard Controls:</h4>
                <ul className="space-y-1 text-xs font-mono">
                  <li><span className="text-white font-bold">W / Up Arrow:</span> Gas / Accelerate</li>
                  <li><span className="text-white font-bold">S / Down Arrow:</span> Brake / Reverse</li>
                  <li><span className="text-white font-bold">A / Left Arrow:</span> Steer Left</li>
                  <li><span className="text-white font-bold">D / Right Arrow:</span> Steer Right</li>
                  <li><span className="text-white font-bold">Shift:</span> Nitro Boost</li>
                  <li><span className="text-white font-bold">H:</span> Horn (makes cars yield)</li>
                </ul>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-emerald-400 mb-1 uppercase text-xs">Mobile Controls:</h4>
                <p className="text-xs text-zinc-400">
                  Use on-screen steering buttons on bottom-left, Gas & Brake pedals on bottom-right.
                </p>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <h4 className="font-bold text-cyan-400 mb-1 uppercase text-xs">Near-Miss Bonus & Coins:</h4>
                <p className="text-xs text-zinc-400">
                  Drive close to traffic at high speed (&gt;80 km/h) to earn Near-Miss bonus points, coins, and extra Nitro. Collect floating gold coins on the highway to buy faster cars in the Garage!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowHelp(false);
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
