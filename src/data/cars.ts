import { CarDefinition, Upgrades } from '../types';

export const CARS_CATALOG: CarDefinition[] = [
  {
    id: 'vortex-gt',
    name: 'Vortex GT',
    category: 'sports',
    price: 0, // Free starter
    unlocked: true,
    baseStats: {
      topSpeed: 195,
      acceleration: 6.2,
      handling: 6.8,
      braking: 6.8,
    },
    defaultColor: '#2563eb', // Apex Royal Blue
    description: 'A well-balanced Japanese sports coupe engineered for agile lane-weaving and responsive highway handling.',
  },
  {
    id: 'thunder-v8',
    name: 'Thunder V8',
    category: 'muscle',
    price: 350,
    unlocked: false,
    baseStats: {
      topSpeed: 218,
      acceleration: 7.9,
      handling: 5.6,
      braking: 6.2,
    },
    defaultColor: '#ea580c', // Sunset Orange
    description: 'Raw American muscle with thunderous low-end torque, aggressive dual racing stripes, and imposing highway presence.',
  },
  {
    id: 'phantom-rs',
    name: 'Phantom RS',
    category: 'super',
    price: 850,
    unlocked: false,
    baseStats: {
      topSpeed: 248,
      acceleration: 8.6,
      handling: 8.2,
      braking: 8.3,
    },
    defaultColor: '#18181b', // Obsidian Black
    description: 'Precision German track-honed supercar boasting active rear wing, carbon fiber aerodynamics, and razor-sharp highway agility.',
  },
  {
    id: 'scuderia-f8',
    name: 'Scuderia Tributo F8',
    category: 'super',
    price: 1450,
    unlocked: false,
    baseStats: {
      topSpeed: 265,
      acceleration: 9.2,
      handling: 9.3,
      braking: 9.1,
    },
    defaultColor: '#dc2626', // Rosso Corsa Red
    description: 'Italian thoroughbred with legendary Maranello racing grace. Twin-turbo flat-plane V8, sculpted S-Duct nose, and sublime aerodynamic poise.',
  },
  {
    id: 'monza-sp',
    name: 'Scuderia Monza SP',
    category: 'super',
    price: 1950,
    unlocked: false,
    baseStats: {
      topSpeed: 278,
      acceleration: 9.5,
      handling: 9.5,
      braking: 9.3,
    },
    defaultColor: '#dc2626', // Rosso Scuderia
    description: 'Bespoke open-cockpit Italian barchetta. Pure speedster minimalism, dual aerodynamic headrest cowls, screaming atmospheric V12, and racing heritage.',
  },
  {
    id: 'nemesis-hyper',
    name: 'Nemesis Hyper',
    category: 'hyper',
    price: 2400,
    unlocked: false,
    baseStats: {
      topSpeed: 288,
      acceleration: 9.7,
      handling: 9.1,
      braking: 9.4,
    },
    defaultColor: '#10b981', // Emerald Venom
    description: 'Prototype endurance hypercar with central shark dorsal fin, extreme ground-effect tunnels, and blistering high-speed stamina.',
  },
  {
    id: 'toro-sv',
    name: 'Toro SV Centenario',
    category: 'hyper',
    price: 3400,
    unlocked: false,
    baseStats: {
      topSpeed: 305,
      acceleration: 9.9,
      handling: 9.6,
      braking: 9.7,
    },
    defaultColor: '#eab308', // Giallo Auge Pearl Yellow
    description: "Savage Italian raging bull with extreme faceted stealth-fighter geometry, screaming naturally aspirated V12, and massive swan-neck carbon wing.",
  },
  {
    id: 'veneno-sv',
    name: 'Diablo Veneno LP-750',
    category: 'hyper',
    price: 4600,
    unlocked: false,
    baseStats: {
      topSpeed: 320,
      acceleration: 10.0,
      handling: 9.8,
      braking: 9.9,
    },
    defaultColor: '#475569', // Grigio Metallizzato
    description: 'Radical Sant’Agata track prototype. Triple roof scoop, towering central dorsal stabilizer fin, red-trimmed carbon aero, and jet-fighter telemetry.',
  },
  {
    id: 'van-apex-cargo',
    name: 'Apex Cargo Turbo Van',
    category: 'van',
    price: 180,
    unlocked: false,
    baseStats: {
      topSpeed: 188,
      acceleration: 6.8,
      handling: 6.5,
      braking: 7.2,
    },
    defaultColor: '#f59e0b', // Industrial Amber
    description: 'High-roof Euro express delivery turbo van. Reinforced box chassis, chrome roof cargo ladder rack, heavy-duty suspension, and punchy turbodiesel torque.',
  },
  {
    id: 'van-dajiban-drift',
    name: 'Dajiban Custom Drift Van',
    category: 'van',
    price: 650,
    unlocked: false,
    baseStats: {
      topSpeed: 216,
      acceleration: 8.0,
      handling: 8.2,
      braking: 7.6,
    },
    defaultColor: '#06b6d4', // Neon Turquoise
    description: 'Slammed Japanese custom racing van. Bolted widebody fenders, deep-dish bronze racing rims, chin splitter, side-exit exhaust flame pipes, and raw drift attitude.',
  },
  {
    id: 'van-cyber-hauler',
    name: 'Cyber Hauler Titan',
    category: 'van',
    price: 1350,
    unlocked: false,
    baseStats: {
      topSpeed: 238,
      acceleration: 8.9,
      handling: 8.5,
      braking: 8.7,
    },
    defaultColor: '#6366f1', // Electric Indigo
    description: 'Next-generation aerodynamic electric van. Full-width matrix LED lightbars, roof aero fin spoiler, instant twin-motor torque, and sleek hyper-van aerodynamics.',
  },
  {
    id: 'tsunami-gtr',
    name: 'Tsunami GT-R V-Spec',
    category: 'sports',
    price: 1150,
    unlocked: false,
    baseStats: {
      topSpeed: 258,
      acceleration: 9.0,
      handling: 8.9,
      braking: 8.6,
    },
    defaultColor: '#2563eb', // Bayside Royal Blue
    description: 'Iconic twin-turbo all-wheel-drive highway legend. Quad circular afterburner taillights, twin hood heat extractors, high GT wing, and legendary highway pedigree.',
  },
  {
    id: 'valkyrie-lm',
    name: 'Valkyrie Hyper-LM',
    category: 'hyper',
    price: 5200,
    unlocked: false,
    baseStats: {
      topSpeed: 330,
      acceleration: 10.0,
      handling: 9.9,
      braking: 10.0,
    },
    defaultColor: '#10b981', // Emerald Venom
    description: 'Ultimate 1000hp endurance racing prototype. Sculpted teardrop canopy, roof periscope ram-air intake, colossal swan-neck wing, and ground-effect venturi tunnels.',
  },
];

export const PAINT_COLORS = [
  { name: 'Rosso Corsa Red', hex: '#dc2626' },
  { name: 'Giallo Pearl Yellow', hex: '#eab308' },
  { name: 'Apex Royal Blue', hex: '#2563eb' },
  { name: 'Verde Mantis Green', hex: '#16a34a' },
  { name: 'Obsidian Stealth Black', hex: '#18181b' },
  { name: 'Bianco Pearl White', hex: '#f8fafc' },
  { name: 'Arancio Sunset Orange', hex: '#ea580c' },
  { name: 'Viola Cyber Purple', hex: '#9333ea' },
  { name: 'Nardo Gunmetal Gray', hex: '#475569' },
  { name: 'Turquoise Neon Glow', hex: '#06b6d4' },
];

export const UPGRADE_BASE_COST = {
  speed: 110,
  accel: 95,
  handling: 90,
  braking: 80,
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
