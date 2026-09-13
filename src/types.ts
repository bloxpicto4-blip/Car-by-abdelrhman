export type GameState = 'MENU' | 'GARAGE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type CarCategory = 'sports' | 'super' | 'muscle' | 'hyper';

export interface CarStats {
  topSpeed: number; // in km/h (e.g., 180 to 280)
  acceleration: number; // 1-10 scale
  handling: number; // 1-10 scale
  braking: number; // 1-10 scale
}

export interface Upgrades {
  speedLevel: number; // 1 to 5
  accelLevel: number; // 1 to 5
  handlingLevel: number; // 1 to 5
  brakingLevel: number; // 1 to 5
}

export interface CarDefinition {
  id: string;
  name: string;
  category: CarCategory;
  price: number;
  unlocked: boolean;
  baseStats: CarStats;
  defaultColor: string;
  description: string;
}

export interface PlayerSaveData {
  coins: number;
  highScore: number;
  bestDistanceMeters: number;
  totalNearMisses: number;
  ownedCars: string[];
  currentCarId: string;
  carUpgrades: Record<string, Upgrades>;
  carColors: Record<string, string>;
  settings: {
    audioEnabled: boolean;
    steeringSensitivity: number; // 0.5 to 1.5
    controlMode: 'buttons' | 'drag';
  };
}

export interface TelemetryData {
  speedKmh: number;
  maxSpeedKmh: number;
  rpm: number;
  gear: number;
  distanceMeters: number;
  score: number;
  multiplier: number;
  coinsEarned: number;
  nearMisses: number;
  nitroPercent: number;
  isNitroActive: boolean;
  isBraking: boolean;
  isHornActive: boolean;
}

export interface NearMissEvent {
  id: number;
  text: string;
  score: number;
  coins: number;
  timestamp: number;
}

export interface InputState {
  steerLeft: boolean;
  steerRight: boolean;
  throttle: boolean;
  brake: boolean;
  nitro: boolean;
  horn: boolean;
  steerAxis: number; // -1 to +1 for smooth analog/drag
}
