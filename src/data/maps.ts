import { MapDefinition, MapId } from '../types';

export const MAPS_CATALOG: MapDefinition[] = [
  {
    id: 'metropolis',
    name: 'Metropolis Night',
    subtitle: 'High-Density Urban Expressway',
    tagline: 'Gleaming skyscrapers, illuminated gantries, and neon city lights.',
    theme: 'city',
    skyColor: 0x0a0f1d,
    fogColor: 0x0a0f1d,
    fogDensity: 0.0068,
    dirLightColor: 0xe2e8f0,
    dirLightIntensity: 1.85,
    ambientColor: 0x2d3748,
    ambientIntensity: 1.35,
    roadColor: 0x222428,
    shoulderColor: 0x171717,
    accentColor: '#3b82f6', // blue
  },
  {
    id: 'sunset-coast',
    name: 'Sunset Coastway',
    subtitle: 'Pacific Ocean Highway',
    tagline: 'Golden hour coastal views, ocean waves, swaying palms, and red sea cliffs.',
    theme: 'coast',
    skyColor: 0xff7e47,
    fogColor: 0x4a2530,
    fogDensity: 0.0055,
    dirLightColor: 0xffedd5,
    dirLightIntensity: 2.3,
    ambientColor: 0x831843,
    ambientIntensity: 1.4,
    roadColor: 0x27272a,
    shoulderColor: 0x451a03,
    accentColor: '#f97316', // orange
  },
  {
    id: 'red-canyon',
    name: 'Red Rock Canyon',
    subtitle: 'Southwest Desert Speedway',
    tagline: 'Towering red sandstone mesas, desert scrub, dramatic dusk canyons, and open road.',
    theme: 'canyon',
    skyColor: 0xd97706,
    fogColor: 0x3f1e14,
    fogDensity: 0.0062,
    dirLightColor: 0xfef3c7,
    dirLightIntensity: 2.1,
    ambientColor: 0x78350f,
    ambientIntensity: 1.25,
    roadColor: 0x292524,
    shoulderColor: 0x451a03,
    accentColor: '#ef4444', // red
  },
  {
    id: 'cyber-tokyo',
    name: 'Cyber Tokyo 2088',
    subtitle: 'Futuristic Neon Elevated Tollway',
    tagline: 'Holographic Japanese signs, violet cyber sky, laser barriers, and rain reflections.',
    theme: 'cyber',
    skyColor: 0x1e0b36,
    fogColor: 0x160829,
    fogDensity: 0.0075,
    dirLightColor: 0x38bdf8,
    dirLightIntensity: 1.7,
    ambientColor: 0x6b21a8,
    ambientIntensity: 1.5,
    roadColor: 0x18181b,
    shoulderColor: 0x2e1065,
    accentColor: '#a855f7', // purple
  },
  {
    id: 'alpine-snow',
    name: 'Alpine Snow Pass',
    subtitle: 'Frozen Mountain Ridge Highway',
    tagline: 'Snow-draped pines, frosty road shoulders, glacial peaks, and icy winter mountain ridges.',
    theme: 'alpine',
    skyColor: 0x93c5fd, // crisp icy morning sky
    fogColor: 0xbfdbfe,
    fogDensity: 0.006,
    dirLightColor: 0xffffff,
    dirLightIntensity: 2.4,
    ambientColor: 0xdbeafe,
    ambientIntensity: 1.35,
    roadColor: 0x1e293b,
    shoulderColor: 0xe2e8f0, // snowbank shoulders
    accentColor: '#0ea5e9', // ice blue
  },
  {
    id: 'industrial-harbor',
    name: 'Harbor Dockway',
    subtitle: 'Container Port & Shipyard Expressway',
    tagline: 'Colossal gantry cranes, multi-tiered shipping container yards, sodium vapor lamps, and sea docks.',
    theme: 'harbor',
    skyColor: 0x0f172a, // dark maritime twilight
    fogColor: 0x0f172a,
    fogDensity: 0.0065,
    dirLightColor: 0xfde047, // sodium dock lighting
    dirLightIntensity: 1.9,
    ambientColor: 0x1e293b,
    ambientIntensity: 1.4,
    roadColor: 0x18181b,
    shoulderColor: 0x09090b,
    accentColor: '#eab308', // dock amber
  },
  {
    id: 'dubai-oasis',
    name: 'Golden Oasis Boulevard',
    subtitle: 'Emirates Luxury Superhighway',
    tagline: 'Gleaming 4-lane expressway, illuminated palm medians, golden architectural towers, and warm sunset dunes.',
    theme: 'desert',
    skyColor: 0xf59e0b, // warm amber twilight
    fogColor: 0x78350f,
    fogDensity: 0.0055,
    dirLightColor: 0xfef08a,
    dirLightIntensity: 2.2,
    ambientColor: 0x92400e,
    ambientIntensity: 1.3,
    roadColor: 0x262626,
    shoulderColor: 0x451a03,
    accentColor: '#f59e0b', // gold
  },
];

export function getMapById(id: MapId): MapDefinition {
  return MAPS_CATALOG.find((m) => m.id === id) || MAPS_CATALOG[0];
}
