import { PlayerSaveData, Upgrades } from '../types';
import { CARS_CATALOG } from '../data/cars';

const STORAGE_KEY = 'traffic_racer_3d_save_v1';

const DEFAULT_UPGRADES: Upgrades = {
  speedLevel: 1,
  accelLevel: 1,
  handlingLevel: 1,
  brakingLevel: 1,
};

export const INITIAL_PLAYER_DATA: PlayerSaveData = {
  coins: 150, // Starting gift to encourage first upgrade or save towards muscle car
  highScore: 0,
  bestDistanceMeters: 0,
  totalNearMisses: 0,
  ownedCars: ['vortex-gt'],
  currentCarId: 'vortex-gt',
  carUpgrades: {
    'vortex-gt': { ...DEFAULT_UPGRADES },
    'thunder-v8': { ...DEFAULT_UPGRADES },
    'phantom-rs': { ...DEFAULT_UPGRADES },
    'nemesis-hyper': { ...DEFAULT_UPGRADES },
  },
  carColors: {
    'vortex-gt': '#dc2626',
    'thunder-v8': '#f59e0b',
    'phantom-rs': '#2563eb',
    'nemesis-hyper': '#10b981',
  },
  settings: {
    audioEnabled: true,
    steeringSensitivity: 1.0,
    controlMode: 'buttons',
  },
};

export function loadGameData(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PLAYER_DATA };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PLAYER_DATA,
      ...parsed,
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
