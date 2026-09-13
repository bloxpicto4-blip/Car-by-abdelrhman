import React, { useState, useEffect } from 'react';
import { PlayerSaveData, Upgrades } from '../types';
import { CARS_CATALOG, PAINT_COLORS, getUpgradeCost, computeEffectiveStats } from '../data/cars';
import { ArrowLeft, Play, Lock, Check, Sparkles, ChevronLeft, ChevronRight, Gauge, Zap, Crosshair, Disc } from 'lucide-react';
import { sound } from '../utils/audio';

interface GarageViewProps {
  playerData: PlayerSaveData;
  onUpdatePlayerData: (updater: (prev: PlayerSaveData) => PlayerSaveData) => void;
  onBackToMenu: () => void;
  onStartRace: () => void;
  onSelectCarForTurntable: (carId: string, colorHex: string, upgrades: Upgrades) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  playerData,
  onUpdatePlayerData,
  onBackToMenu,
  onStartRace,
  onSelectCarForTurntable,
}) => {
  const [selectedCarIndex, setSelectedCarIndex] = useState(() => {
    const idx = CARS_CATALOG.findIndex((c) => c.id === playerData.currentCarId);
    return idx >= 0 ? idx : 0;
  });

  const car = CARS_CATALOG[selectedCarIndex];
  const isOwned = playerData.ownedCars.includes(car.id);
  const isEquipped = playerData.currentCarId === car.id;

  const upgrades = playerData.carUpgrades[car.id] || {
    speedLevel: 1,
    accelLevel: 1,
    handlingLevel: 1,
    brakingLevel: 1,
  };

  const currentColor = playerData.carColors[car.id] || car.defaultColor;
  const effectiveStats = computeEffectiveStats(car, upgrades);

  // Notify 3D engine whenever active car, paint, or upgrade changes
  useEffect(() => {
    onSelectCarForTurntable(car.id, currentColor, upgrades);
  }, [car.id, currentColor, upgrades, onSelectCarForTurntable]);

  const handlePrevCar = () => {
    sound.playClick();
    setSelectedCarIndex((prev) => (prev > 0 ? prev - 1 : CARS_CATALOG.length - 1));
  };

  const handleNextCar = () => {
    sound.playClick();
    setSelectedCarIndex((prev) => (prev < CARS_CATALOG.length - 1 ? prev + 1 : 0));
  };

  const handleBuyCar = () => {
    if (playerData.coins < car.price) {
      sound.playClick();
      return;
    }

    sound.playUpgrade();
    onUpdatePlayerData((prev) => ({
      ...prev,
      coins: prev.coins - car.price,
      ownedCars: [...prev.ownedCars, car.id],
      currentCarId: car.id,
    }));
  };

  const handleEquipCar = () => {
    sound.playClick();
    onUpdatePlayerData((prev) => ({
      ...prev,
      currentCarId: car.id,
    }));
  };

  const handleUpgrade = (type: keyof Upgrades) => {
    const currentLevel = upgrades[type];
    if (currentLevel >= 5) return;

    const cost = getUpgradeCost(type, currentLevel);
    if (playerData.coins < cost) {
      sound.playClick();
      return;
    }

    sound.playUpgrade();
    onUpdatePlayerData((prev) => {
      const existingUpgrades = prev.carUpgrades[car.id] || {
        speedLevel: 1,
        accelLevel: 1,
        handlingLevel: 1,
        brakingLevel: 1,
      };
      return {
        ...prev,
        coins: prev.coins - cost,
        carUpgrades: {
          ...prev.carUpgrades,
          [car.id]: {
            ...existingUpgrades,
            [type]: currentLevel + 1,
          },
        },
      };
    });
  };

  const handleSelectColor = (hex: string) => {
    sound.playClick();
    onUpdatePlayerData((prev) => ({
      ...prev,
      carColors: {
        ...prev.carColors,
        [car.id]: hex,
      },
    }));
  };

  const upgradeEntries: { key: keyof Upgrades; label: string; icon: React.ReactNode; currentVal: string }[] = [
    { key: 'speedLevel', label: 'Top Speed', icon: <Gauge className="w-4 h-4 text-emerald-400" />, currentVal: `${effectiveStats.topSpeed} km/h` },
    { key: 'accelLevel', label: 'Acceleration', icon: <Zap className="w-4 h-4 text-amber-400" />, currentVal: `${effectiveStats.acceleration}/10` },
    { key: 'handlingLevel', label: 'Handling', icon: <Crosshair className="w-4 h-4 text-cyan-400" />, currentVal: `${effectiveStats.handling}/10` },
    { key: 'brakingLevel', label: 'Braking', icon: <Disc className="w-4 h-4 text-red-400" />, currentVal: `${effectiveStats.braking}/10` },
  ];

  return (
    <div id="garage-view" className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-6 bg-gradient-to-b from-zinc-950/70 via-transparent to-zinc-950/95 pointer-events-none select-none text-white font-sans">
      {/* Top Header: Navigation & Coins Wallet */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto pointer-events-auto">
        <button
          id="garage-back-btn"
          onClick={() => {
            sound.playClick();
            onBackToMenu();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-sm">Back to Menu</span>
        </button>

        <div className="flex items-center gap-2 bg-zinc-900/90 border border-amber-500/40 px-4 py-2 rounded-xl shadow-lg">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-zinc-950 text-xs font-black shadow">
            $
          </div>
          <span className="font-black text-amber-400 tabular-nums text-lg">{playerData.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Middle Carousel Controls (Floating above 3D car) */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto pointer-events-auto my-auto">
        <button
          id="garage-prev-car"
          onClick={handlePrevCar}
          className="w-12 h-12 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 active:scale-95 flex items-center justify-center text-white transition shadow-xl"
          title="Previous Car"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center: Car Name & Category Badge */}
        <div className="flex flex-col items-center bg-zinc-950/80 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-zinc-800 shadow-2xl">
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
            {car.category} CLASS ({selectedCarIndex + 1}/{CARS_CATALOG.length})
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{car.name}</h2>
          <p className="text-xs text-zinc-400 max-w-sm text-center mt-0.5 line-clamp-1">
            {car.description}
          </p>
        </div>

        <button
          id="garage-next-car"
          onClick={handleNextCar}
          className="w-12 h-12 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 active:scale-95 flex items-center justify-center text-white transition shadow-xl"
          title="Next Car"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Panel: Upgrades, Paint Colors & Action Button */}
      <div className="w-full max-w-5xl mx-auto bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left: 4 Upgrades Sliders & Buttons */}
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Performance Upgrades
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">Stage 1 - 5</span>
            </div>

            {upgradeEntries.map(({ key, label, icon, currentVal }) => {
              const lvl = upgrades[key];
              const isMax = lvl >= 5;
              const cost = getUpgradeCost(key, lvl);
              const canAfford = playerData.coins >= cost;

              return (
                <div key={key} className="flex items-center justify-between gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-2 min-w-[130px]">
                    {icon}
                    <div>
                      <div className="text-xs font-bold text-zinc-200">{label}</div>
                      <div className="text-[11px] font-semibold text-emerald-400 tabular-nums">{currentVal}</div>
                    </div>
                  </div>

                  {/* Level Dots (1-5) */}
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-2.5 w-6 rounded-full transition-all ${
                          step <= lvl
                            ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                            : 'bg-zinc-800 border border-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Upgrade Button */}
                  <button
                    disabled={!isOwned || isMax || !canAfford}
                    onClick={() => handleUpgrade(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 min-w-[85px] justify-center ${
                      isMax
                        ? 'bg-zinc-800 text-zinc-500 cursor-default'
                        : !isOwned
                        ? 'bg-zinc-800/60 text-zinc-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? (
                      'MAX'
                    ) : (
                      <>
                        <span>Upgrade</span>
                        <span className="font-mono text-[11px]">${cost}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Paint Shop & Primary Action (Buy / Equip / Race) */}
          <div className="md:col-span-5 flex flex-col justify-between h-full gap-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4">
            {/* Paint Palette */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-2">
                Custom Paint Finish
              </span>
              <div className="flex flex-wrap gap-2">
                {PAINT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => handleSelectColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-xl transition shadow-md border-2 ${
                      currentColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-white scale-110 shadow-white/30'
                        : 'border-zinc-800 hover:border-zinc-500'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Action State: Buy vs Equip / Race */}
            <div className="pt-2">
              {!isOwned ? (
                <button
                  id="garage-buy-btn"
                  onClick={handleBuyCar}
                  disabled={playerData.coins < car.price}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition shadow-xl ${
                    playerData.coins >= car.price
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 hover:brightness-110 active:scale-98 shadow-amber-500/30 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span>Unlock Car (${car.price.toLocaleString()})</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {!isEquipped && (
                    <button
                      id="garage-equip-btn"
                      onClick={handleEquipCar}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-600 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Select as Active Car</span>
                    </button>
                  )}

                  <button
                    id="garage-race-now-btn"
                    onClick={() => {
                      if (!isEquipped) handleEquipCar();
                      sound.playClick();
                      onStartRace();
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-zinc-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 shadow-xl shadow-red-600/30 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-zinc-950" />
                    <span>Race This Machine</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
