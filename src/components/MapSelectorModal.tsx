import React from 'react';
import { MapId, MapDefinition } from '../types';
import { MAPS_CATALOG } from '../data/maps';
import { X, Check, MapPin, Sparkles, Compass, Sun, Mountain, Building2, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface MapSelectorModalProps {
  currentMapId: MapId;
  onSelectMap: (mapId: MapId) => void;
  onClose: () => void;
}

export const MapSelectorModal: React.FC<MapSelectorModalProps> = ({
  currentMapId,
  onSelectMap,
  onClose,
}) => {
  const getThemeIcon = (theme: MapDefinition['theme']) => {
    switch (theme) {
      case 'city':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'coast':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'canyon':
        return <Mountain className="w-5 h-5 text-red-400" />;
      case 'cyber':
        return <Zap className="w-5 h-5 text-purple-400" />;
      default:
        return <Compass className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getGradientBg = (id: MapId) => {
    switch (id) {
      case 'metropolis':
        return 'from-blue-950/60 via-slate-900/40 to-zinc-950/80 border-blue-500/30 hover:border-blue-400';
      case 'sunset-coast':
        return 'from-amber-950/60 via-orange-950/40 to-zinc-950/80 border-orange-500/30 hover:border-orange-400';
      case 'red-canyon':
        return 'from-red-950/60 via-stone-900/40 to-zinc-950/80 border-red-500/30 hover:border-red-400';
      case 'cyber-tokyo':
        return 'from-purple-950/60 via-indigo-950/40 to-zinc-950/80 border-purple-500/30 hover:border-purple-400';
      default:
        return 'from-zinc-900/60 to-zinc-950/80 border-zinc-700';
    }
  };

  return (
    <div
      id="map-selector-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/85 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-3xl bg-zinc-900/95 border border-zinc-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <MapPin className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                Select Highway Track
              </h2>
              <p className="text-xs text-zinc-400 font-medium">Choose your racing environment and scenic route</p>
            </div>
          </div>

          <button
            id="map-selector-close-btn"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition border border-zinc-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Maps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 overflow-y-auto pr-1">
          {MAPS_CATALOG.map((mapDef) => {
            const isSelected = mapDef.id === currentMapId;

            return (
              <div
                key={mapDef.id}
                id={`map-card-${mapDef.id}`}
                onClick={() => {
                  sound.playClick();
                  onSelectMap(mapDef.id);
                }}
                className={`relative group rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer bg-gradient-to-br ${getGradientBg(
                  mapDef.id
                )} ${
                  isSelected
                    ? 'ring-2 ring-amber-400/80 shadow-xl shadow-amber-500/10 border-amber-400'
                    : 'hover:scale-[1.01]'
                }`}
              >
                {/* Active Equipped Badge */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-amber-400 text-zinc-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EQUIPPED</span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 shadow">
                    {getThemeIcon(mapDef.theme)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {mapDef.subtitle}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{mapDef.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-4 line-clamp-2">
                  {mapDef.tagline}
                </p>

                {/* Scenery Features Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
                  {mapDef.theme === 'city' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-800/60 font-semibold">Skyscrapers</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-semibold">Overpasses</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold">Billboards</span>
                    </>
                  )}
                  {mapDef.theme === 'coast' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-950/70 text-orange-300 border border-orange-800/60 font-semibold">Pacific Ocean</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold">Palm Trees</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/70 text-red-300 border border-red-800/60 font-semibold">Sea Cliffs</span>
                    </>
                  )}
                  {mapDef.theme === 'canyon' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/70 text-red-300 border border-red-800/60 font-semibold">Red Mesas</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold">Saguaro Cacti</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-950/70 text-orange-300 border border-orange-800/60 font-semibold">Dusk Canyon</span>
                    </>
                  )}
                  {mapDef.theme === 'cyber' && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/60 font-semibold">Holo Signs</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold">Neon Pillars</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-950/70 text-pink-300 border border-pink-800/60 font-semibold">Rain Reflection</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Weather conditions cycle dynamically on all maps
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95"
          >
            Confirm Track
          </button>
        </div>
      </div>
    </div>
  );
};
