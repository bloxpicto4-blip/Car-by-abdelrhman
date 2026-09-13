export type GameState = 'MENU' | 'GARAGE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'MULTIPLAYER_LOBBY';

export type WeatherCondition = 'clear' | 'rainy' | 'foggy';

export type MapId =
  | 'metropolis'
  | 'sunset-coast'
  | 'red-canyon'
  | 'cyber-tokyo'
  | 'alpine-snow'
  | 'industrial-harbor'
  | 'dubai-oasis';

export interface MapDefinition {
  id: MapId;
  name: string;
  subtitle: string;
  tagline: string;
  theme: 'city' | 'coast' | 'canyon' | 'cyber' | 'alpine' | 'harbor' | 'desert';
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  dirLightColor: number;
  dirLightIntensity: number;
  ambientColor: number;
  ambientIntensity: number;
  roadColor: number;
  shoulderColor: number;
  accentColor: string; // for UI badge
}

export type CarCategory = 'sports' | 'super' | 'muscle' | 'hyper' | 'van';


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
  currentMapId: MapId;
  carUpgrades: Record<string, Upgrades>;
  carColors: Record<string, string>;
  settings: {
    audioEnabled: boolean;
    steeringSensitivity: number; // 0.5 to 1.5
    controlMode: 'buttons' | 'drag';
  };
}

export type TrafficLightState = 'green' | 'yellow' | 'red';

export interface TrafficSignalTelemetry {
  state: TrafficLightState;
  distanceMeters: number;
  isRed: boolean;
  timeRemaining: number;
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
  weather: WeatherCondition;
  map: MapId;
  trafficSignal?: TrafficSignalTelemetry | null;
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

export interface MultiplayerPlayer {
  id: string;
  name: string;
  carId: string;
  carColor: string;
  isHost: boolean;
  isReady: boolean;
  x: number;
  y: number;
  z: number;
  speedMs: number;
  steerAngle: number;
  isBraking: boolean;
  isNitro: boolean;
  isCrashing: boolean;
  distanceMeters: number;
  score: number;
  emote?: { text: string; timestamp: number };
}

export interface MultiplayerRoom {
  code: string;
  name: string;
  hostId: string;
  mapId: MapId;
  state: 'waiting' | 'starting' | 'racing' | 'finished';
  countdown?: number;
  players: Record<string, MultiplayerPlayer>;
}

export interface MultiplayerLeaderboardEntry {
  id: string;
  name: string;
  carId: string;
  distanceMeters: number;
  speedKmh: number;
  score: number;
  isCrashing: boolean;
  isSelf: boolean;
}

