import { PlayerSaveData, Upgrades } from '../types';
import { CARS_CATALOG } from '../data/cars';

const STORAGE_KEY = 'traffic_racer_3d_save_v2';

const DEFAULT_UPGRADES: Upgrades = {
  speedLevel: 1,
  accelLevel: 1,
  handlingLevel: 1,
  brakingLevel: 1,
};

export const INITIAL_PLAYER_DATA: PlayerSaveData = {
  coins: 250, // Starting gift to encourage first upgrades or save toward garage cars
  highScore: 0,
  bestDistanceMeters: 0,
  totalNearMisses: 0,
  ownedCars: ['vortex-gt'],
  currentCarId: 'vortex-gt',
  currentMapId: 'metropolis',
  carUpgrades: {
    'vortex-gt': { ...DEFAULT_UPGRADES },
    'thunder-v8': { ...DEFAULT_UPGRADES },
    'phantom-rs': { ...DEFAULT_UPGRADES },
    'scuderia-f8': { ...DEFAULT_UPGRADES },
    'nemesis-hyper': { ...DEFAULT_UPGRADES },
    'toro-sv': { ...DEFAULT_UPGRADES },
  },
  carColors: {
    'vortex-gt': '#2563eb',
    'thunder-v8': '#ea580c',
    'phantom-rs': '#18181b',
    'scuderia-f8': '#dc2626',
    'nemesis-hyper': '#10b981',
    'toro-sv': '#eab308',
  },
  settings: {
    audioEnabled: true,
    steeringSensitivity: 1.0,
    controlMode: 'buttons',
  },
};

export function loadGameData(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('traffic_racer_3d_save_v1');
    if (!raw) return { ...INITIAL_PLAYER_DATA };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PLAYER_DATA,
      ...parsed,
      currentMapId: parsed.currentMapId || 'metropolis',
      ownedCars: Array.isArray(parsed.ownedCars) && parsed.ownedCars.length > 0 ? parsed.ownedCars : ['vortex-gt'],
      carUpgrades: {
        ...INITIAL_PLAYER_DATA.carUpgrades,
        ...(parsed.carUpgrades || {}),
      },
      carColors: {
        ...INITIAL_PLAYER_DATA.carColors,
        ...(parsed.carColors || {}),
      },
      settings: {
        ...INITIAL_PLAYER_DATA.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (e) {
    console.warn('Could not load game data from localStorage, using fallback:', e);
    return { ...INITIAL_PLAYER_DATA };
  }
}

export function saveGameData(data: PlayerSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save game data to localStorage:', e);
  }
}
