import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, InputState, NearMissEvent, PlayerSaveData, TelemetryData, Upgrades, MapId } from './types';
import { loadGameData, saveGameData } from './utils/storage';
import { CARS_CATALOG } from './data/cars';
import { GameEngine } from './game/GameEngine';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GarageView } from './components/GarageView';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [playerData, setPlayerData] = useState<PlayerSaveData>(() => loadGameData());
  const [isMuted, setIsMuted] = useState<boolean>(() => !playerData.settings.audioEnabled);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speedKmh: 0,
    maxSpeedKmh: 200,
    rpm: 1000,
    gear: 1,
    distanceMeters: 0,
    score: 0,
    multiplier: 1.0,
    coinsEarned: 0,
    nearMisses: 0,
    nitroPercent: 100,
    isNitroActive: false,
    isBraking: false,
    isHornActive: false,
    weather: 'clear',
  });

  const [nearMissEvents, setNearMissEvents] = useState<NearMissEvent[]>([]);
  const [gameOverSummary, setGameOverSummary] = useState<{
    finalScore: number;
    distanceMeters: number;
    maxSpeedKmh: number;
    nearMisses: number;
    coinsEarned: number;
  } | null>(null);

  const [isHighScore, setIsHighScore] = useState(false);

  // Turntable animation state for garage
  const turntableAngleRef = useRef<number>(0);
  const turntableAnimIdRef = useRef<number | null>(null);

  // Keep sound mute state in sync
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  // Persist player data to localStorage whenever updated
  useEffect(() => {
    saveGameData(playerData);
  }, [playerData]);

  // Initialize GameEngine once container is mounted
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onTelemetry: (t) => {
        setTelemetry(t);
      },
      onNearMiss: (event) => {
        setNearMissEvents((prev) => [...prev.slice(-3), event]);
      },
      onCoinCollected: (totalCoins, value) => {
        // Realtime coin increment during active race
      },
      onGameOver: (summary) => {
        // Finalize rewards & high score
        setPlayerData((prev) => {
          const isNewHigh = summary.finalScore > prev.highScore;
          setIsHighScore(isNewHigh);

          return {
            ...prev,
            coins: prev.coins + summary.coinsEarned,
            highScore: Math.max(prev.highScore, summary.finalScore),
            bestDistanceMeters: Math.max(prev.bestDistanceMeters, summary.distanceMeters),
            totalNearMisses: prev.totalNearMisses + summary.nearMisses,
          };
        });

        setGameOverSummary(summary);
        setGameState('GAMEOVER');
      },
    });

    engineRef.current = engine;

    // Apply current equipped car
    const currentCar = CARS_CATALOG.find((c) => c.id === playerData.currentCarId) || CARS_CATALOG[0];
    const currentPaint = playerData.carColors[currentCar.id] || currentCar.defaultColor;
    const currentUpgrades = playerData.carUpgrades[currentCar.id] || {
      speedLevel: 1,
      accelLevel: 1,
      handlingLevel: 1,
      brakingLevel: 1,
    };
    engine.setCar(currentCar, currentPaint, currentUpgrades);
    engine.setMap(playerData.currentMapId || 'metropolis');

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Handle Garage 3D turntable loop
  useEffect(() => {
    if (gameState === 'GARAGE' && engineRef.current) {
      const currentCar = CARS_CATALOG.find((c) => c.id === playerData.currentCarId) || CARS_CATALOG[0];
      const currentPaint = playerData.carColors[currentCar.id] || currentCar.defaultColor;
      const currentUpgrades = playerData.carUpgrades[currentCar.id] || {
        speedLevel: 1,
        accelLevel: 1,
        handlingLevel: 1,
        brakingLevel: 1,
      };

      const animateTurntable = () => {
        turntableAngleRef.current += 0.012;
        if (engineRef.current) {
          engineRef.current.renderTurntable(currentCar, currentPaint, currentUpgrades, turntableAngleRef.current);
        }
        turntableAnimIdRef.current = requestAnimationFrame(animateTurntable);
      };

      turntableAnimIdRef.current = requestAnimationFrame(animateTurntable);

      return () => {
        if (turntableAnimIdRef.current) {
          cancelAnimationFrame(turntableAnimIdRef.current);
          turntableAnimIdRef.current = null;
        }
      };
    }
  }, [gameState, playerData.currentCarId, playerData.carColors, playerData.carUpgrades]);

  // Keyboard Input Controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      const code = e.code;
      if (gameState === 'PLAYING') {
        if (code === 'KeyW' || code === 'ArrowUp') {
          engineRef.current.setInput({ throttle: true });
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          engineRef.current.setInput({ brake: true });
        } else if (code === 'KeyA' || code === 'ArrowLeft') {
          engineRef.current.setInput({ steerLeft: true });
        } else if (code === 'KeyD' || code === 'ArrowRight') {
          engineRef.current.setInput({ steerRight: true });
        } else if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') {
          engineRef.current.setInput({ nitro: true });
        } else if (code === 'KeyH') {
          engineRef.current.setInput({ horn: true });
        } else if (code === 'Escape' || code === 'KeyP') {
          handlePause();
        }
      } else if (gameState === 'PAUSED') {
        if (code === 'Escape' || code === 'KeyP') {
          handleResume();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current || gameState !== 'PLAYING') return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        engineRef.current.setInput({ throttle: false });
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        engineRef.current.setInput({ brake: false });
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        engineRef.current.setInput({ steerLeft: false });
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        engineRef.current.setInput({ steerRight: false });
      } else if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') {
        engineRef.current.setInput({ nitro: false });
      } else if (code === 'KeyH') {
        engineRef.current.setInput({ horn: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game flow triggers
  const handleStartRace = useCallback(() => {
    if (!engineRef.current) return;
    const currentCar = CARS_CATALOG.find((c) => c.id === playerData.currentCarId) || CARS_CATALOG[0];
    const currentPaint = playerData.carColors[currentCar.id] || currentCar.defaultColor;
    const currentUpgrades = playerData.carUpgrades[currentCar.id] || {
      speedLevel: 1,
      accelLevel: 1,
      handlingLevel: 1,
      brakingLevel: 1,
    };

    engineRef.current.setCar(currentCar, currentPaint, currentUpgrades);
    setNearMissEvents([]);
    setGameState('PLAYING');
    engineRef.current.startRace();
  }, [playerData.currentCarId, playerData.carColors, playerData.carUpgrades]);

  const handlePause = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.setPaused(true);
    setGameState('PAUSED');
  }, []);

  const handleResume = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.setPaused(false);
    setGameState('PLAYING');
  }, []);

  const handleRestartRace = useCallback(() => {
    handleStartRace();
  }, [handleStartRace]);

  const handleGoToGarage = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stopRace();
    }
    setGameState('GARAGE');
  }, []);

  const handleGoToMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stopRace();
    }
    setGameState('MENU');
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setPlayerData((pd) => ({
        ...pd,
        settings: {
          ...pd.settings,
          audioEnabled: !next,
        },
      }));
      return next;
    });
  }, []);

  const handleTurntableSelect = useCallback((carId: string, colorHex: string, upgrades: Upgrades) => {
    if (!engineRef.current) return;
    const carDef = CARS_CATALOG.find((c) => c.id === carId) || CARS_CATALOG[0];
    engineRef.current.renderTurntable(carDef, colorHex, upgrades, turntableAngleRef.current);
  }, []);

  const handleSelectMap = useCallback((mapId: MapId) => {
    setPlayerData((prev) => ({
      ...prev,
      currentMapId: mapId,
    }));
    if (engineRef.current) {
      engineRef.current.setMap(mapId);
    }
  }, []);

  return (
    <div id="game-root" className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        id="canvas-container"
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Main Menu Overlay */}
      {gameState === 'MENU' && (
        <MainMenu
          playerData={playerData}
          onStartRace={handleStartRace}
          onOpenGarage={handleGoToGarage}
          onSelectMap={handleSelectMap}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Garage Showroom Overlay */}
      {gameState === 'GARAGE' && (
        <GarageView
          playerData={playerData}
          onUpdatePlayerData={setPlayerData}
          onBackToMenu={handleGoToMenu}
          onStartRace={handleStartRace}
          onSelectCarForTurntable={handleTurntableSelect}
          onSelectMap={handleSelectMap}
        />
      )}

      {/* Active Race In-Game HUD & Mobile Controls */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD
          telemetry={telemetry}
          nearMisses={nearMissEvents}
          onInputChange={(input) => {
            if (engineRef.current && gameState === 'PLAYING') {
              engineRef.current.setInput(input);
            }
          }}
          onPause={handlePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestartRace}
          onGoToGarage={handleGoToGarage}
          onGoToMenu={handleGoToMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && gameOverSummary && (
        <GameOverModal
          summary={gameOverSummary}
          isHighScore={isHighScore}
          totalCoins={playerData.coins}
          onRestart={handleRestartRace}
          onGoToGarage={handleGoToGarage}
          onGoToMenu={handleGoToMenu}
        />
      )}
    </div>
  );
}
