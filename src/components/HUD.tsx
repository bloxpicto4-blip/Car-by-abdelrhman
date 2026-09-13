import React from 'react';
import { TelemetryData, NearMissEvent, InputState } from '../types';
import {
  Volume2,
  VolumeX,
  Pause,
  Zap,
  Megaphone,
  ArrowLeft,
  ArrowRight,
  Sun,
  CloudRain,
  CloudFog,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { getMapById } from '../data/maps';

interface HUDProps {
  telemetry: TelemetryData;
  nearMisses: NearMissEvent[];
  onInputChange: (input: Partial<InputState>) => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  telemetry,
  nearMisses,
  onInputChange,
  onPause,
  isMuted,
  onToggleMute,
}) => {
  // Mobile touch handlers for responsive controls
  const handleTouchStart = (action: keyof InputState, val: boolean) => {
    onInputChange({ [action]: val });
  };

  const handleTouchEnd = (action: keyof InputState) => {
    onInputChange({ [action]: false });
  };

  const speedPercentage = Math.min(100, (telemetry.speedKmh / telemetry.maxSpeedKmh || 250) * 100);

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans">
      {/* Top Bar: Stats, Coins & Quick Actions */}
      <div className="flex items-start justify-between w-full z-10">
        {/* Left: Score & Distance */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 bg-zinc-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-zinc-700/60 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Score</span>
            <span className="text-2xl font-black tabular-nums tracking-tight text-white">
              {telemetry.score.toLocaleString()}
            </span>
            {telemetry.multiplier > 1.0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {telemetry.multiplier.toFixed(1)}x
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-zinc-900/60 backdrop-blur px-3 py-1 rounded-md border border-zinc-800">
            <span className="text-zinc-500">Distance:</span>
            <span className="font-bold text-white tabular-nums">
              {(telemetry.distanceMeters / 1000).toFixed(2)} km
            </span>
            <span className="text-zinc-500 ml-2">Near Misses:</span>
            <span className="font-bold text-amber-400 tabular-nums">{telemetry.nearMisses}</span>
          </div>
        </div>

        {/* Center: Near Miss & Traffic Signal Alert Notifications */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center gap-1.5 w-full max-w-md px-4 pointer-events-none">
          {nearMisses.slice(-2).map((nm) => (
            <div
              key={nm.id}
              className="animate-bounce flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-zinc-950 font-black text-sm sm:text-base px-4 py-1.5 rounded-full shadow-xl border border-amber-300"
            >
              <span>⚡</span>
              <span>{nm.text}</span>
              <span className="bg-zinc-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                +${nm.coins}
              </span>
            </div>
          ))}

          {/* Approaching Highway Traffic Light Signal HUD */}
          {telemetry.trafficSignal && telemetry.trafficSignal.distanceMeters > 0 && telemetry.trafficSignal.distanceMeters < 240 && (
            <div
              id="hud-traffic-signal-indicator"
              className={`flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-200 ${
                telemetry.trafficSignal.state === 'red'
                  ? 'bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/40 animate-pulse'
                  : telemetry.trafficSignal.state === 'yellow'
                  ? 'bg-amber-950/90 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                  : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              }`}
            >
              {/* Traffic Light Head Icon with 3 Lenses */}
              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-700 shadow-inner">
                <span
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    telemetry.trafficSignal.state === 'red'
                      ? 'bg-red-500 shadow-[0_0_10px_#ef4444] scale-110'
                      : 'bg-red-950/50'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    telemetry.trafficSignal.state === 'yellow'
                      ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b] scale-110'
                      : 'bg-amber-950/50'
                  }`}
                />
                <span
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    telemetry.trafficSignal.state === 'green'
                      ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] scale-110'
                      : 'bg-emerald-950/50'
                  }`}
                />
              </div>

              {/* Status Message */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  {telemetry.trafficSignal.state === 'red' && (
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider">
                    {telemetry.trafficSignal.state === 'red'
                      ? 'RED LIGHT — WEAVE STOPPED TRAFFIC'
                      : telemetry.trafficSignal.state === 'yellow'
                      ? 'CAUTION — SIGNAL CHANGING'
                      : 'SIGNAL GREEN — SPEED CLEAR'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold opacity-90">
                  <span>{Math.round(telemetry.trafficSignal.distanceMeters ?? 0)}m ahead</span>
                  <span className="mx-1">•</span>
                  <span>{Math.max(0, Math.round(telemetry.trafficSignal.timeRemaining ?? 0))}s left</span>
                </div>
              </div>

              {/* Distance Meter Ring / Badge */}
              <div className="bg-zinc-950/80 px-2 py-1 rounded-md text-[11px] font-black text-white tabular-nums border border-zinc-700/60">
                {Math.round(telemetry.trafficSignal.distanceMeters)}m
              </div>
            </div>
          )}
        </div>

        {/* Right: Map & Weather Condition, Coins Wallet & Audio/Pause Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Active Map Badge */}
          <div
            id="hud-map-badge"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 shadow-lg text-xs font-bold text-zinc-200"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span className="truncate max-w-[120px]">{getMapById(telemetry.map).name}</span>
          </div>

          {/* Dynamic Weather Indicator */}
          <div
            id="hud-weather-badge"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border shadow-lg text-xs font-bold transition-colors ${
              telemetry.weather === 'rainy'
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-200'
                : telemetry.weather === 'foggy'
                ? 'bg-slate-900/80 border-slate-500/50 text-slate-200'
                : 'bg-zinc-900/80 border-zinc-700/60 text-amber-300'
            }`}
          >
            {telemetry.weather === 'rainy' ? (
              <CloudRain className="w-4 h-4 text-blue-400 animate-pulse" />
            ) : telemetry.weather === 'foggy' ? (
              <CloudFog className="w-4 h-4 text-slate-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="capitalize tracking-wider">{telemetry.weather}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/40 shadow-lg text-amber-400 font-black">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-zinc-950 text-xs font-black shadow">
              $
            </div>
            <span className="tabular-nums text-lg text-white">+{telemetry.coinsEarned}</span>
          </div>

          <button
            id="hud-mute-btn"
            onClick={onToggleMute}
            className="w-10 h-10 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            id="hud-pause-btn"
            onClick={onPause}
            className="w-10 h-10 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition shadow"
            title="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Center: Speedometer & Nitro Gauge */}
      <div className="flex flex-col items-center justify-center z-10">
        <div className="flex items-end gap-3 bg-zinc-950/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-zinc-800 shadow-2xl">
          {/* Gear */}
          <div className="flex flex-col items-center pb-1">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Gear</span>
            <span className="text-xl font-black text-amber-400 leading-none">
              {telemetry.gear}
            </span>
          </div>

          {/* Large Digital Speed */}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-white">
              {telemetry.speedKmh}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-zinc-400 uppercase tracking-widest">
              km/h
            </span>
          </div>

          {/* RPM Bar */}
          <div className="flex flex-col gap-1 pb-1 w-20 sm:w-28">
            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
              <span>RPM</span>
              <span className="tabular-nums font-bold text-zinc-200">{telemetry.rpm}</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                style={{ width: `${Math.min(100, (telemetry.rpm / 8000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nitro Energy Bar */}
        <div className="w-64 sm:w-80 mt-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 shadow-lg flex items-center gap-2">
          <Zap className={`w-4 h-4 ${telemetry.isNitroActive ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`} />
          <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-cyan-900/60">
            <div
              className={`h-full transition-all duration-100 ${
                telemetry.isNitroActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600'
              }`}
              style={{ width: `${telemetry.nitroPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-cyan-300 tabular-nums">
            {telemetry.nitroPercent}%
          </span>
        </div>
      </div>

      {/* Touch On-Screen Controls for Mobile & Tablets (Active touch targets) */}
      <div className="flex items-end justify-between w-full pointer-events-auto mt-auto pb-1">
        {/* Left Side: Steering Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-steer-left"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900/85 backdrop-blur-md border-2 border-zinc-700 active:border-amber-400 active:bg-amber-500/20 active:scale-95 text-white flex flex-col items-center justify-center transition shadow-2xl touch-none"
            onPointerDown={() => handleTouchStart('steerLeft', true)}
            onPointerUp={() => handleTouchEnd('steerLeft')}
            onPointerLeave={() => handleTouchEnd('steerLeft')}
            title="Steer Left (A / Left Arrow)"
          >
            <ArrowLeft className="w-7 h-7 sm:w-9 sm:h-9" />
            <span className="text-[10px] font-extrabold uppercase text-zinc-400">Left</span>
          </button>

          <button
            id="mobile-steer-right"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900/85 backdrop-blur-md border-2 border-zinc-700 active:border-amber-400 active:bg-amber-500/20 active:scale-95 text-white flex flex-col items-center justify-center transition shadow-2xl touch-none"
            onPointerDown={() => handleTouchStart('steerRight', true)}
            onPointerUp={() => handleTouchEnd('steerRight')}
            onPointerLeave={() => handleTouchEnd('steerRight')}
            title="Steer Right (D / Right Arrow)"
          >
            <ArrowRight className="w-7 h-7 sm:w-9 sm:h-9" />
            <span className="text-[10px] font-extrabold uppercase text-zinc-400">Right</span>
          </button>
        </div>

        {/* Center: Horn & Desktop Help */}
        <div className="flex flex-col items-center gap-1">
          <button
            id="mobile-horn-btn"
            className="px-4 py-2 rounded-xl bg-zinc-900/80 backdrop-blur border border-zinc-700 active:bg-zinc-800 text-zinc-300 active:text-amber-400 flex items-center gap-1.5 transition touch-none text-xs font-bold"
            onPointerDown={() => handleTouchStart('horn', true)}
            onPointerUp={() => handleTouchEnd('horn')}
            onPointerLeave={() => handleTouchEnd('horn')}
            title="Horn (H)"
          >
            <Megaphone className="w-4 h-4" />
            <span>HORN (H)</span>
          </button>

          <div className="hidden sm:block text-[11px] text-zinc-400/80 bg-zinc-950/60 px-2 py-0.5 rounded font-mono">
            WASD / Arrows • Space/S: Brake • Shift: Nitro
          </div>
        </div>

        {/* Right Side: Brake & Throttle Pedals */}
        <div className="flex items-center gap-3">
          {/* Nitro Button */}
          <button
            id="mobile-nitro-btn"
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition shadow-2xl flex flex-col items-center justify-center touch-none ${
              telemetry.nitroPercent > 5
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 active:bg-cyan-500 active:text-zinc-950 active:scale-95'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-600 opacity-60'
            }`}
            onPointerDown={() => handleTouchStart('nitro', true)}
            onPointerUp={() => handleTouchEnd('nitro')}
            onPointerLeave={() => handleTouchEnd('nitro')}
            title="Nitro Boost (Shift)"
          >
            <Zap className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-wider">Nitro</span>
          </button>

          {/* Brake Pedal */}
          <button
            id="mobile-brake-btn"
            className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-zinc-900/90 backdrop-blur-md border-2 border-red-900/80 active:border-red-500 active:bg-red-600/30 active:scale-95 text-red-400 flex flex-col items-center justify-center transition shadow-2xl touch-none"
            onPointerDown={() => handleTouchStart('brake', true)}
            onPointerUp={() => handleTouchEnd('brake')}
            onPointerLeave={() => handleTouchEnd('brake')}
            title="Brake / Reverse (S / Down Arrow)"
          >
            <div className="w-7 h-2 bg-red-500/60 rounded-full mb-1" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Brake</span>
          </button>

          {/* Throttle Pedal */}
          <button
            id="mobile-throttle-btn"
            className="w-16 h-24 sm:w-20 sm:h-28 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border-2 border-emerald-600/80 active:border-emerald-400 active:from-emerald-700 active:to-emerald-950 active:scale-95 text-emerald-400 flex flex-col items-center justify-center transition shadow-2xl touch-none"
            onPointerDown={() => handleTouchStart('throttle', true)}
            onPointerUp={() => handleTouchEnd('throttle')}
            onPointerLeave={() => handleTouchEnd('throttle')}
            title="Gas / Accelerate (W / Up Arrow)"
          >
            <div className="w-7 h-2 bg-emerald-400/80 rounded-full mb-1" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Gas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
