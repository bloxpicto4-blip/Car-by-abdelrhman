import { CarDefinition, Upgrades } from '../types';

export const CARS_CATALOG: CarDefinition[] = [
  {
    id: 'vortex-gt',
    name: 'Vortex GT',
    category: 'sports',
    price: 0, // Free starter
    unlocked: true,
    baseStats: {
      topSpeed: 190,
      acceleration: 6.0,
      handling: 6.5,
      braking: 6.5,
    },
    defaultColor: '#dc2626', // Flame Red
    description: 'A well-balanced Japanese sports coupe engineered for agile lane-weaving and responsive highway handling.',
  },
  {
    id: 'thunder-v8',
    name: 'Thunder V8',
    category: 'muscle',
    price: 350,
    unlocked: false,
    baseStats: {
      topSpeed: 215,
      acceleration: 7.8,
      handling: 5.5,
      braking: 6.0,
    },
    defaultColor: '#f59e0b', // Amber Gold
    description: 'Raw American muscle with thunderous low-end torque, aggressive dual racing stripes, and imposing highway presence.',
  },
  {
    id: 'phantom-rs',
    name: 'Phantom RS',
    category: 'super',
    price: 900,
    unlocked: false,
    baseStats: {
      topSpeed: 245,
      acceleration: 8.5,
      handling: 8.0,
      braking: 8.0,
    },
    defaultColor: '#2563eb', // Apex Royal Blue
    description: 'European mid-engine supercar boasting track-honed aerodynamics, carbon fiber wing, and blisteringly fast acceleration.',
  },
  {
    id: 'nemesis-hyper',
    name: 'Nemesis Hyper',
    category: 'hyper',
    price: 2200,
    unlocked: false,
    baseStats: {
      topSpeed: 285,
      acceleration: 9.8,
      handling: 9.2,
      braking: 9.5,
    },
    defaultColor: '#10b981', // Emerald Venom
    description: 'The pinnacle of prototype hypercar engineering. Ground-effect aerodynamics, active aero fins, and unrivaled top speed.',
  },
];

export const PAINT_COLORS = [
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Apex Blue', hex: '#2563eb' },
  { name: 'Sunset Amber', hex: '#f59e0b' },
  { name: 'Emerald Venom', hex: '#10b981' },
  { name: 'Stealth Black', hex: '#18181b' },
  { name: 'Pearlescent White', hex: '#f4f4f5' },
  { name: 'Cyber Violet', hex: '#8b5cf6' },
  { name: 'Acid Neon', hex: '#84cc16' },
];

export const UPGRADE_BASE_COST = {
  speed: 100,
  accel: 90,
  handling: 85,
  braking: 75,
};

export function getUpgradeCost(type: keyof Upgrades, currentLevel: number): number {
  if (currentLevel >= 5) return 0;
  const baseMap: Record<keyof Upgrades, number> = {
    speedLevel: UPGRADE_BASE_COST.speed,
    accelLevel: UPGRADE_BASE_COST.accel,
    handlingLevel: UPGRADE_BASE_COST.handling,
    brakingLevel: UPGRADE_BASE_COST.braking,
  };
  return Math.round(baseMap[type] * Math.pow(1.65, currentLevel - 1));
}

export function computeEffectiveStats(car: CarDefinition, upgrades: Upgrades) {
  // Each upgrade adds ~5-7% to base stats
  const speedBonus = (upgrades.speedLevel - 1) * 9; // +36 km/h at max
  const accelBonus = (upgrades.accelLevel - 1) * 0.45;
  const handlingBonus = (upgrades.handlingLevel - 1) * 0.45;
  const brakingBonus = (upgrades.brakingLevel - 1) * 0.45;

  return {
    topSpeed: Math.round(car.baseStats.topSpeed + speedBonus),
    acceleration: Math.min(10, Number((car.baseStats.acceleration + accelBonus).toFixed(1))),
    handling: Math.min(10, Number((car.baseStats.handling + handlingBonus).toFixed(1))),
    braking: Math.min(10, Number((car.baseStats.braking + brakingBonus).toFixed(1))),
  };
}
