import * as THREE from 'three';
import { MapDefinition } from '../types';
import { MAPS_CATALOG } from '../data/maps';

export interface CoinPickup {
  mesh: THREE.Group;
  lane: number;
  position: THREE.Vector3;
  collected: boolean;
  chunkIndex: number;
}

export const HIGHWAY_WIDTH = 17.0; // 4 lanes (~4.0m each) + shoulders
export const LANE_X = [-5.7, -1.9, 1.9, 5.7]; // 4 distinct driving lanes
export const CHUNK_LENGTH = 80;
export const CHUNKS_COUNT = 6;

// Reusable Materials
const asphaltMat = new THREE.MeshStandardMaterial({
  color: 0x222428,
  roughness: 0.85,
  metalness: 0.1,
});

const shoulderMat = new THREE.MeshStandardMaterial({
  color: 0x171717,
  roughness: 0.9,
  metalness: 0.05,
});

const laneMarkingMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const yellowLineMat = new THREE.MeshBasicMaterial({
  color: 0xf59e0b,
});

const guardrailMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  metalness: 0.8,
  roughness: 0.35,
});

const concreteBarrierMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.9,
});

// Themed Materials
const oceanWaterMat = new THREE.MeshStandardMaterial({
  color: 0x0369a1,
  roughness: 0.15,
  metalness: 0.85,
});

const sandBeachMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.95,
});

const palmTrunkMat = new THREE.MeshStandardMaterial({
  color: 0x78350f,
  roughness: 0.9,
});

const palmLeavesMat = new THREE.MeshStandardMaterial({
  color: 0x15803d,
  roughness: 0.7,
});

const redRockMat = new THREE.MeshStandardMaterial({
  color: 0xb45309,
  roughness: 0.9,
  metalness: 0.1,
});

const cactusMat = new THREE.MeshStandardMaterial({
  color: 0x166534,
  roughness: 0.8,
});

const cyberNeonCyanMat = new THREE.MeshBasicMaterial({
  color: 0x06b6d4,
});

const cyberNeonPinkMat = new THREE.MeshBasicMaterial({
  color: 0xec4899,
});

const cyberNeonPurpleMat = new THREE.MeshBasicMaterial({
  color: 0xa855f7,
});

// Alpine Snow Materials
const snowWhiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.9,
  metalness: 0.05,
});

const snowPineBarkMat = new THREE.MeshStandardMaterial({
  color: 0x3e2723,
  roughness: 0.9,
});

const snowPineNeedlesMat = new THREE.MeshStandardMaterial({
  color: 0x064e3b,
  roughness: 0.75,
});

const glacierRockMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.85,
  metalness: 0.2,
});

// Industrial Harbor Materials
const harborWaterMat = new THREE.MeshStandardMaterial({
  color: 0x0b1329,
  roughness: 0.2,
  metalness: 0.8,
});

const craneYellowMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.4,
  metalness: 0.7,
});

const beaconRedMat = new THREE.MeshBasicMaterial({
  color: 0xef4444,
});

const containerMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.4 }), // Maersk Blue
  new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5, metalness: 0.4 }), // Evergreen Green
  new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5, metalness: 0.4 }), // Hapag Orange
  new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5, metalness: 0.4 }), // Maritime Red
  new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5, metalness: 0.4 }), // Cargo Yellow
];

// Dubai Golden Oasis Materials
const goldArchMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  emissive: 0xd97706,
  emissiveIntensity: 0.35,
  roughness: 0.25,
  metalness: 0.85,
});

const duneSandMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.95,
});

const luxuryGlassMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.8,
});

const buildingMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.5 }),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.4 }),
  new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.6 }),
  new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.7 }),
];

const windowGlowMaterials = [
  new THREE.MeshBasicMaterial({ color: 0xfef08a }), // warm yellow
  new THREE.MeshBasicMaterial({ color: 0x93c5fd }), // cyan/sky
  new THREE.MeshBasicMaterial({ color: 0xf472b6 }), // pink neon
  new THREE.MeshBasicMaterial({ color: 0x38bdf8 }), // vivid electric blue
];

const coinMat = new THREE.MeshStandardMaterial({
  color: 0xfbbf24,
  emissive: 0xd97706,
  emissiveIntensity: 0.5,
  metalness: 0.95,
  roughness: 0.15,
});

const coinEdgeMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  metalness: 0.9,
  roughness: 0.25,
});

// Single coin generator
export function createCoinMesh(): THREE.Group {
  const coinGroup = new THREE.Group();

  const cylinderGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 18);
  cylinderGeo.rotateX(Math.PI / 2);
  const cylinder = new THREE.Mesh(cylinderGeo, coinMat);
  coinGroup.add(cylinder);

  const torusGeo = new THREE.TorusGeometry(0.52, 0.07, 8, 20);
  const torus = new THREE.Mesh(torusGeo, coinEdgeMat);
  coinGroup.add(torus);

  const innerGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);
  const inner = new THREE.Mesh(innerGeo, coinEdgeMat);
  coinGroup.add(inner);

  coinGroup.position.y = 0.9;
  return coinGroup;
}

export class HighwayEnvironment {
  public scene: THREE.Scene;
  public currentMap: MapDefinition;
  public chunks: THREE.Group[] = [];
  public coins: CoinPickup[] = [];
  private nextChunkZ: number = 0;

  constructor(scene: THREE.Scene, initialMap: MapDefinition = MAPS_CATALOG[0]) {
    this.scene = scene;
    this.currentMap = initialMap;
    this.applyMapPalette(initialMap);
    this.initChunks();
  }

  public setMap(mapDef: MapDefinition) {
    this.currentMap = mapDef;
    this.applyMapPalette(mapDef);

    // Rebuild all chunks for new map theme
    this.clearChunks();
    this.initChunks();
  }

  private clearChunks() {
    this.chunks.forEach((chunk) => {
      this.scene.remove(chunk);
    });
    this.chunks = [];
    this.coins = [];
  }

  private applyMapPalette(mapDef: MapDefinition) {
    asphaltMat.color.setHex(mapDef.roadColor);
    shoulderMat.color.setHex(mapDef.shoulderColor);
  }

  private initChunks() {
    const startZ = -CHUNK_LENGTH;
    for (let i = 0; i < CHUNKS_COUNT; i++) {
      const zPos = startZ + i * CHUNK_LENGTH;
      const chunk = this.buildHighwayChunk(zPos, i);
      this.chunks.push(chunk);
      this.scene.add(chunk);
      this.spawnCoinsForChunk(chunk, zPos, i);
    }
    this.nextChunkZ = startZ + CHUNKS_COUNT * CHUNK_LENGTH;
  }

  private buildHighwayChunk(zCenter: number, chunkIndex: number): THREE.Group {
    const chunk = new THREE.Group();
    chunk.name = `HighwayChunk_${chunkIndex}`;
    chunk.position.z = zCenter;

    // 1. Road surface (asphalt)
    const roadGeo = new THREE.PlaneGeometry(HIGHWAY_WIDTH, CHUNK_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, asphaltMat);
    road.receiveShadow = true;
    chunk.add(road);

    // 2. Road shoulders (left & right asphalt extensions)
    const shoulderWidth = 4.0;
    const leftShoulderGeo = new THREE.PlaneGeometry(shoulderWidth, CHUNK_LENGTH);
    leftShoulderGeo.rotateX(-Math.PI / 2);
    const leftShoulder = new THREE.Mesh(leftShoulderGeo, shoulderMat);
    leftShoulder.position.x = -HIGHWAY_WIDTH * 0.5 - shoulderWidth * 0.5;
    chunk.add(leftShoulder);

    const rightShoulderGeo = new THREE.PlaneGeometry(shoulderWidth, CHUNK_LENGTH);
    rightShoulderGeo.rotateX(-Math.PI / 2);
    const rightShoulder = new THREE.Mesh(rightShoulderGeo, shoulderMat);
    rightShoulder.position.x = HIGHWAY_WIDTH * 0.5 + shoulderWidth * 0.5;
    chunk.add(rightShoulder);

    // 3. Lane Markings
    // Outer solid yellow shoulder lines
    const yellowLineGeo = new THREE.PlaneGeometry(0.18, CHUNK_LENGTH);
    yellowLineGeo.rotateX(-Math.PI / 2);
    const leftYellow = new THREE.Mesh(yellowLineGeo, yellowLineMat);
    leftYellow.position.set(-HIGHWAY_WIDTH * 0.5 + 0.3, 0.02, 0);
    chunk.add(leftYellow);

    const rightYellow = new THREE.Mesh(yellowLineGeo, yellowLineMat);
    rightYellow.position.set(HIGHWAY_WIDTH * 0.5 - 0.3, 0.02, 0);
    chunk.add(rightYellow);

    // Center dashed white stripes between 4 lanes (3 dividing lines)
    const dividerX = [-3.8, 0, 3.8];
    const dashesCount = Math.floor(CHUNK_LENGTH / 7); // 3.5m stripe, 3.5m gap

    dividerX.forEach((x) => {
      for (let d = 0; d < dashesCount; d++) {
        const stripeGeo = new THREE.PlaneGeometry(0.22, 3.8);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripe = new THREE.Mesh(stripeGeo, laneMarkingMat);
        const zOffset = -CHUNK_LENGTH * 0.5 + d * 7 + 2.0;
        stripe.position.set(x, 0.02, zOffset);
        chunk.add(stripe);
      }
    });

    // 4. Guardrails and Barriers
    const guardrailY = 0.55;
    const railGeo = new THREE.BoxGeometry(0.2, 0.35, CHUNK_LENGTH);

    // Left barrier
    const leftBarrier = new THREE.Mesh(railGeo, concreteBarrierMat);
    leftBarrier.position.set(-HIGHWAY_WIDTH * 0.5 - 0.2, guardrailY, 0);
    chunk.add(leftBarrier);

    // Right barrier
    const rightBarrier = new THREE.Mesh(railGeo, guardrailMat);
    rightBarrier.position.set(HIGHWAY_WIDTH * 0.5 + 0.2, guardrailY, 0);
    chunk.add(rightBarrier);

    // Cyberpunk neon edge strips
    if (this.currentMap.theme === 'cyber') {
      const neonStripGeo = new THREE.BoxGeometry(0.08, 0.08, CHUNK_LENGTH);
      const leftNeon = new THREE.Mesh(neonStripGeo, cyberNeonCyanMat);
      leftNeon.position.set(-HIGHWAY_WIDTH * 0.5 - 0.05, 0.74, 0);
      chunk.add(leftNeon);

      const rightNeon = new THREE.Mesh(neonStripGeo, cyberNeonPinkMat);
      rightNeon.position.set(HIGHWAY_WIDTH * 0.5 + 0.05, 0.74, 0);
      chunk.add(rightNeon);
    }

    // Barrier posts
    const postCount = 6;
    for (let p = 0; p < postCount; p++) {
      const pz = -CHUNK_LENGTH * 0.5 + (p / postCount) * CHUNK_LENGTH;
      const postGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);

      const leftPost = new THREE.Mesh(postGeo, concreteBarrierMat);
      leftPost.position.set(-HIGHWAY_WIDTH * 0.5 - 0.2, 0.35, pz);
      chunk.add(leftPost);

      const rightPost = new THREE.Mesh(postGeo, guardrailMat);
      rightPost.position.set(HIGHWAY_WIDTH * 0.5 + 0.2, 0.35, pz);
      chunk.add(rightPost);
    }

    // 5. Themed Roadside Scenery (City, Coast, Canyon, Cyber, Alpine, Harbor, Desert)
    const theme = this.currentMap.theme;
    if (theme === 'coast') {
      this.addCoastalScenery(chunk, chunkIndex);
    } else if (theme === 'canyon') {
      this.addCanyonScenery(chunk, chunkIndex);
    } else if (theme === 'cyber') {
      this.addCyberScenery(chunk, chunkIndex);
    } else if (theme === 'alpine') {
      this.addAlpineScenery(chunk, chunkIndex);
    } else if (theme === 'harbor') {
      this.addHarborScenery(chunk, chunkIndex);
    } else if (theme === 'desert') {
      this.addDesertScenery(chunk, chunkIndex);
    } else {
      // Default Metropolis City
      this.addCityScenery(chunk, chunkIndex);
    }

    return chunk;
  }

  // -------------------------------------------------------------
  // THEME 1: METROPOLIS CITY
  // -------------------------------------------------------------
  private addCityScenery(chunk: THREE.Group, chunkIndex: number) {
    // Street lamps
    this.addStreetLamp(chunk, -HIGHWAY_WIDTH * 0.5 - 1.2, -CHUNK_LENGTH * 0.25, 1);
    this.addStreetLamp(chunk, HIGHWAY_WIDTH * 0.5 + 1.2, CHUNK_LENGTH * 0.25, -1);

    // Overhead highway gantry every 3rd chunk
    if (chunkIndex % 3 === 0) {
      this.addOverheadGantry(chunk, 0, 'Metropolis Express');
    }

    // Left & right skyscrapers
    const bCount = 4;
    [-1, 1].forEach((side) => {
      for (let i = 0; i < bCount; i++) {
        const bWidth = 14 + Math.random() * 12;
        const bDepth = 14 + Math.random() * 12;
        const bHeight = 35 + Math.random() * 65;
        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];

        const building = new THREE.Mesh(bGeo, bMat);
        const posX = side * (HIGHWAY_WIDTH * 0.5 + 18 + Math.random() * 20);
        const posZ = -CHUNK_LENGTH * 0.5 + (i / bCount) * CHUNK_LENGTH + (Math.random() * 8 - 4);
        building.position.set(posX, bHeight * 0.5, posZ);
        chunk.add(building);

        // Window bands
        for (let w = 0; w < 4; w++) {
          const win = new THREE.Mesh(
            new THREE.BoxGeometry(bWidth * 0.8, 0.45, bDepth + 0.1),
            windowGlowMaterials[Math.floor(Math.random() * windowGlowMaterials.length)]
          );
          win.position.set(posX, 6 + w * 7, posZ);
          chunk.add(win);
        }
      }
    });
  }

  // -------------------------------------------------------------
  // THEME 2: SUNSET COASTWAY
  // -------------------------------------------------------------
  private addCoastalScenery(chunk: THREE.Group, chunkIndex: number) {
    // 1. Right side: Golden sunset ocean & beach
    const oceanGeo = new THREE.PlaneGeometry(120, CHUNK_LENGTH);
    oceanGeo.rotateX(-Math.PI / 2);
    const ocean = new THREE.Mesh(oceanGeo, oceanWaterMat);
    ocean.position.set(HIGHWAY_WIDTH * 0.5 + 64, -0.6, 0);
    chunk.add(ocean);

    // Sandy coastline strip
    const sandGeo = new THREE.PlaneGeometry(12, CHUNK_LENGTH);
    sandGeo.rotateX(-Math.PI / 2);
    const sand = new THREE.Mesh(sandGeo, sandBeachMat);
    sand.position.set(HIGHWAY_WIDTH * 0.5 + 8, -0.2, 0);
    chunk.add(sand);

    // Palm trees along the right coast shoulder
    const palmCount = 3;
    for (let p = 0; p < palmCount; p++) {
      const pz = -CHUNK_LENGTH * 0.45 + (p / palmCount) * CHUNK_LENGTH + Math.random() * 4;
      const px = HIGHWAY_WIDTH * 0.5 + 4.5 + Math.random() * 2.5;
      this.addPalmTree(chunk, px, pz);
    }

    // 2. Left side: Rocky cliffs & coastal cliffs
    const cliffCount = 4;
    for (let c = 0; c < cliffCount; c++) {
      const cliffH = 20 + Math.random() * 25;
      const cliffGeo = new THREE.ConeGeometry(12 + Math.random() * 6, cliffH, 6);
      const cliff = new THREE.Mesh(cliffGeo, redRockMat);
      const px = -HIGHWAY_WIDTH * 0.5 - 14 - Math.random() * 12;
      const pz = -CHUNK_LENGTH * 0.5 + (c / cliffCount) * CHUNK_LENGTH;
      cliff.position.set(px, cliffH * 0.5 - 2, pz);
      cliff.rotation.y = Math.random() * Math.PI;
      chunk.add(cliff);
    }

    // Seaside lampposts
    this.addStreetLamp(chunk, -HIGHWAY_WIDTH * 0.5 - 1.2, 0, 1);
  }

  private addPalmTree(chunk: THREE.Group, x: number, z: number) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Curved trunk
    const trunkH = 6.5 + Math.random() * 2.0;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, trunkH, 7), palmTrunkMat);
    trunk.position.y = trunkH * 0.5;
    trunk.rotation.z = (Math.random() - 0.5) * 0.2;
    palm.add(trunk);

    // Crown of fronds
    const frondCount = 6;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondGeo = new THREE.BoxGeometry(2.8, 0.08, 0.7);
      const frond = new THREE.Mesh(frondGeo, palmLeavesMat);
      frond.position.set(Math.cos(angle) * 1.3, trunkH, Math.sin(angle) * 1.3);
      frond.rotation.y = -angle;
      frond.rotation.z = -0.35;
      palm.add(frond);
    }

    chunk.add(palm);
  }

  // -------------------------------------------------------------
  // THEME 3: RED ROCK CANYON
  // -------------------------------------------------------------
  private addCanyonScenery(chunk: THREE.Group, chunkIndex: number) {
    // Desert ground extensions
    [-1, 1].forEach((side) => {
      const desertFloor = new THREE.Mesh(new THREE.PlaneGeometry(100, CHUNK_LENGTH), sandBeachMat);
      desertFloor.rotateX(-Math.PI / 2);
      desertFloor.position.set(side * (HIGHWAY_WIDTH * 0.5 + 50), -0.1, 0);
      chunk.add(desertFloor);
    });

    // Towering Red Sandstone Buttes on both sides
    [-1, 1].forEach((side) => {
      const mesaCount = 3;
      for (let m = 0; m < mesaCount; m++) {
        const mw = 18 + Math.random() * 15;
        const md = 18 + Math.random() * 15;
        const mh = 25 + Math.random() * 35;
        const mesa = new THREE.Mesh(new THREE.BoxGeometry(mw, mh, md), redRockMat);
        const px = side * (HIGHWAY_WIDTH * 0.5 + 24 + Math.random() * 18);
        const pz = -CHUNK_LENGTH * 0.5 + (m / mesaCount) * CHUNK_LENGTH + (Math.random() * 6 - 3);
        mesa.position.set(px, mh * 0.5, pz);
        chunk.add(mesa);
      }
    });

    // Saguaro Cacti along highway borders
    const cactusCount = 4;
    for (let c = 0; c < cactusCount; c++) {
      const side = c % 2 === 0 ? -1 : 1;
      const px = side * (HIGHWAY_WIDTH * 0.5 + 3.5 + Math.random() * 2.5);
      const pz = -CHUNK_LENGTH * 0.45 + (c / cactusCount) * CHUNK_LENGTH;
      this.addCactus(chunk, px, pz);
    }
  }

  private addCactus(chunk: THREE.Group, x: number, z: number) {
    const cactus = new THREE.Group();
    cactus.position.set(x, 0, z);

    // Main trunk
    const h = 3.5 + Math.random() * 1.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, h, 8), cactusMat);
    trunk.position.y = h * 0.5;
    cactus.add(trunk);

    // Side arms
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), cactusMat);
    arm1.position.set(0.4, h * 0.55, 0);
    cactus.add(arm1);

    const arm1Up = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8), cactusMat);
    arm1Up.position.set(0.75, h * 0.55 + 0.45, 0);
    cactus.add(arm1Up);

    chunk.add(cactus);
  }

  // -------------------------------------------------------------
  // THEME 4: CYBER TOKYO 2088
  // -------------------------------------------------------------
  private addCyberScenery(chunk: THREE.Group, chunkIndex: number) {
    // Neon overhead gantry ring every 2nd chunk
    if (chunkIndex % 2 === 0) {
      this.addCyberPortalRing(chunk, 0);
    }

    // Glowing Holographic Billboards
    [-1, 1].forEach((side) => {
      const boardGeo = new THREE.BoxGeometry(0.2, 6.5, 12.0);
      const boardMat = side > 0 ? cyberNeonCyanMat : cyberNeonPinkMat;
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(side * (HIGHWAY_WIDTH * 0.5 + 6.5), 7.5, 0);
      chunk.add(board);

      // Support pylon
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 8.0, 8), guardrailMat);
      pylon.position.set(side * (HIGHWAY_WIDTH * 0.5 + 6.5), 4.0, 0);
      chunk.add(pylon);
    });

    // Dark mega-towers in the background with neon window streaks
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i++) {
        const tw = 20 + Math.random() * 12;
        const th = 60 + Math.random() * 70;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(tw, th, tw), buildingMaterials[3]);
        const px = side * (HIGHWAY_WIDTH * 0.5 + 26 + Math.random() * 15);
        const pz = -CHUNK_LENGTH * 0.5 + i * 28;
        tower.position.set(px, th * 0.5, pz);
        chunk.add(tower);

        // Neon vertical spine streak
        const streak = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, th * 0.8, 0.3),
          i % 2 === 0 ? cyberNeonPurpleMat : cyberNeonCyanMat
        );
        streak.position.set(px - side * (tw * 0.5 + 0.2), th * 0.5, pz);
        chunk.add(streak);
      }
    });
  }

  private addCyberPortalRing(chunk: THREE.Group, z: number) {
    const portal = new THREE.Group();
    portal.position.set(0, 0, z);

    const span = HIGHWAY_WIDTH + 4.5;
    const height = 8.5;

    // Uprights
    [-span * 0.5, span * 0.5].forEach((px) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, height, 0.5), guardrailMat);
      p.position.set(px, height * 0.5, 0);
      portal.add(p);

      const neonP = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, 0.52), cyberNeonCyanMat);
      neonP.position.set(px, height * 0.5, 0);
      portal.add(neonP);
    });

    // Overhead beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.6, 0.6), guardrailMat);
    beam.position.set(0, height, 0);
    portal.add(beam);

    const beamNeon = new THREE.Mesh(new THREE.BoxGeometry(span, 0.12, 0.65), cyberNeonPinkMat);
    beamNeon.position.set(0, height - 0.25, 0);
    portal.add(beamNeon);

    chunk.add(portal);
  }

  // -------------------------------------------------------------
  // THEME 5: ALPINE SNOW PASS
  // -------------------------------------------------------------
  private addAlpineScenery(chunk: THREE.Group, chunkIndex: number) {
    // 1. Snow ground on both sides of highway
    [-1, 1].forEach((side) => {
      const snowFloor = new THREE.Mesh(new THREE.PlaneGeometry(100, CHUNK_LENGTH), snowWhiteMat);
      snowFloor.rotateX(-Math.PI / 2);
      snowFloor.position.set(side * (HIGHWAY_WIDTH * 0.5 + 50), -0.05, 0);
      chunk.add(snowFloor);
    });

    // 2. Snowbanks along guardrails
    [-1, 1].forEach((side) => {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, CHUNK_LENGTH), snowWhiteMat);
      bank.position.set(side * (HIGHWAY_WIDTH * 0.5 + 1.2), 0.2, 0);
      chunk.add(bank);
    });

    // 3. Jagged snow-covered alpine mountain peaks in the distance
    [-1, 1].forEach((side) => {
      const peakCount = 2;
      for (let p = 0; p < peakCount; p++) {
        const peakH = 45 + Math.random() * 35;
        const peakR = 18 + Math.random() * 12;
        const peakGeo = new THREE.ConeGeometry(peakR, peakH, 5);
        const peak = new THREE.Mesh(peakGeo, glacierRockMat);
        const px = side * (HIGHWAY_WIDTH * 0.5 + 32 + Math.random() * 20);
        const pz = -CHUNK_LENGTH * 0.5 + p * 36;
        peak.position.set(px, peakH * 0.5 - 2, pz);
        chunk.add(peak);

        // Snow-capped peak top
        const capGeo = new THREE.ConeGeometry(peakR * 0.5, peakH * 0.45, 5);
        const cap = new THREE.Mesh(capGeo, snowWhiteMat);
        cap.position.set(px, peakH * 0.78, pz);
        chunk.add(cap);
      }
    });

    // 4. Dense snow pine trees along roadside
    const pineCount = 5;
    for (let i = 0; i < pineCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const px = side * (HIGHWAY_WIDTH * 0.5 + 4.5 + Math.random() * 8);
      const pz = -CHUNK_LENGTH * 0.45 + (i / pineCount) * CHUNK_LENGTH + Math.random() * 3;
      this.addSnowPine(chunk, px, pz);
    }
  }

  private addSnowPine(chunk: THREE.Group, x: number, z: number) {
    const pine = new THREE.Group();
    pine.position.set(x, 0, z);

    // Trunk
    const trunkH = 5.5 + Math.random() * 2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, trunkH, 6), snowPineBarkMat);
    trunk.position.y = trunkH * 0.5;
    pine.add(trunk);

    // 3 Tiers of snow-dusted foliage cones
    for (let t = 0; t < 3; t++) {
      const radius = 2.4 - t * 0.6;
      const coneH = 3.2 - t * 0.5;
      const greenCone = new THREE.Mesh(new THREE.ConeGeometry(radius, coneH, 6), snowPineNeedlesMat);
      greenCone.position.y = trunkH * 0.45 + t * 1.6;
      pine.add(greenCone);

      const snowCap = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.6, 0.8, 6), snowWhiteMat);
      snowCap.position.y = trunkH * 0.45 + t * 1.6 + coneH * 0.4;
      pine.add(snowCap);
    }

    chunk.add(pine);
  }

  // -------------------------------------------------------------
  // THEME 6: INDUSTRIAL HARBOR DOCKWAY
  // -------------------------------------------------------------
  private addHarborScenery(chunk: THREE.Group, chunkIndex: number) {
    // 1. Right side: Harbor water dock
    const water = new THREE.Mesh(new THREE.PlaneGeometry(120, CHUNK_LENGTH), harborWaterMat);
    water.rotateX(-Math.PI / 2);
    water.position.set(HIGHWAY_WIDTH * 0.5 + 64, -0.6, 0);
    chunk.add(water);

    // Concrete pier edge
    const pier = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, CHUNK_LENGTH), concreteBarrierMat);
    pier.position.set(HIGHWAY_WIDTH * 0.5 + 5, -0.1, 0);
    chunk.add(pier);

    // 2. Colossal shipyard gantry crane every 2 chunks
    if (chunkIndex % 2 === 0) {
      this.addShipyardCrane(chunk, HIGHWAY_WIDTH * 0.5 + 24, 0);
    }

    // 3. Multi-color stacked shipping containers on both sides
    [-1, 1].forEach((side) => {
      const stackCount = 3;
      for (let s = 0; s < stackCount; s++) {
        const pz = -CHUNK_LENGTH * 0.4 + s * 22;
        const px = side * (HIGHWAY_WIDTH * 0.5 + 9 + Math.random() * 4);
        const tiers = 2 + Math.floor(Math.random() * 2); // 2-3 containers high

        for (let tier = 0; tier < tiers; tier++) {
          const cMat = containerMaterials[Math.floor(Math.random() * containerMaterials.length)];
          const container = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.5, 6.2), cMat);
          container.position.set(px, 1.25 + tier * 2.55, pz);
          container.castShadow = true;
          chunk.add(container);

          // Corner casting details
          const border = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.15, 6.22), guardrailMat);
          border.position.set(px, 0.1 + tier * 2.55, pz);
          chunk.add(border);
        }
      }
    });

    // Sodium dock floodlights
    this.addStreetLamp(chunk, -HIGHWAY_WIDTH * 0.5 - 1.2, 0, 1);
  }

  private addShipyardCrane(chunk: THREE.Group, x: number, z: number) {
    const crane = new THREE.Group();
    crane.position.set(x, 0, z);

    const craneH = 34;
    // 4 legs
    [-4, 4].forEach((lx) => {
      [-6, 6].forEach((lz) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.2, craneH, 1.2), craneYellowMat);
        leg.position.set(lx, craneH * 0.5, lz);
        crane.add(leg);
      });
    });

    // Top boom arm
    const boom = new THREE.Mesh(new THREE.BoxGeometry(32, 2.2, 4.0), craneYellowMat);
    boom.position.set(-6, craneH, 0);
    crane.add(boom);

    // Operator cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.0, 3.5), buildingMaterials[0]);
    cabin.position.set(0, craneH - 2.5, 0);
    crane.add(cabin);

    // Red warning beacon at the very top
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), beaconRedMat);
    beacon.position.set(-6, craneH + 2.0, 0);
    crane.add(beacon);

    chunk.add(crane);
  }

  // -------------------------------------------------------------
  // THEME 7: DUBAI GOLDEN OASIS
  // -------------------------------------------------------------
  private addDesertScenery(chunk: THREE.Group, chunkIndex: number) {
    // 1. Warm desert dunes on both sides
    [-1, 1].forEach((side) => {
      const dunes = new THREE.Mesh(new THREE.PlaneGeometry(100, CHUNK_LENGTH), duneSandMat);
      dunes.rotateX(-Math.PI / 2);
      dunes.position.set(side * (HIGHWAY_WIDTH * 0.5 + 50), -0.05, 0);
      chunk.add(dunes);
    });

    // 2. Golden architectural luxury arch spanning the highway every 3 chunks
    if (chunkIndex % 3 === 0) {
      this.addDubaiArch(chunk, 0);
    }

    // 3. Illuminated Golden Palm Trees along highway margins
    const palmCount = 4;
    for (let p = 0; p < palmCount; p++) {
      const side = p % 2 === 0 ? -1 : 1;
      const px = side * (HIGHWAY_WIDTH * 0.5 + 4.0);
      const pz = -CHUNK_LENGTH * 0.45 + (p / palmCount) * CHUNK_LENGTH;
      this.addPalmTree(chunk, px, pz);
    }

    // 4. Futuristic gold & glass skyscraper spires
    [-1, 1].forEach((side) => {
      const spireH = 50 + Math.random() * 50;
      const spireW = 14 + Math.random() * 8;
      const spireGeo = new THREE.ConeGeometry(spireW * 0.6, spireH, 6);
      const spire = new THREE.Mesh(spireGeo, goldArchMat);
      const px = side * (HIGHWAY_WIDTH * 0.5 + 26 + Math.random() * 12);
      const pz = -CHUNK_LENGTH * 0.3;
      spire.position.set(px, spireH * 0.5, pz);
      chunk.add(spire);

      // Glass crown
      const glassCrown = new THREE.Mesh(new THREE.ConeGeometry(spireW * 0.3, 14, 6), luxuryGlassMat);
      glassCrown.position.set(px, spireH + 4, pz);
      chunk.add(glassCrown);
    });
  }

  private addDubaiArch(chunk: THREE.Group, z: number) {
    const arch = new THREE.Group();
    arch.position.set(0, 0, z);

    const span = HIGHWAY_WIDTH + 6.0;
    const archH = 11.0;

    // Curved golden arch pillars
    [-span * 0.5, span * 0.5].forEach((px) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, archH, 1.2), goldArchMat);
      p.position.set(px, archH * 0.5, 0);
      arch.add(p);
    });

    const crossArch = new THREE.Mesh(new THREE.BoxGeometry(span + 2.0, 1.4, 1.8), goldArchMat);
    crossArch.position.set(0, archH, 0);
    arch.add(crossArch);

    // Warm glowing under-light strip
    const lightStrip = new THREE.Mesh(
      new THREE.BoxGeometry(span, 0.25, 1.2),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lightStrip.position.set(0, archH - 0.75, 0);
    arch.add(lightStrip);

    chunk.add(arch);
  }

  private addStreetLamp(chunk: THREE.Group, x: number, z: number, side: number) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0, z);

    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 7.5, 8);
    const pole = new THREE.Mesh(poleGeo, guardrailMat);
    pole.position.y = 3.75;
    lampGroup.add(pole);

    const armGeo = new THREE.BoxGeometry(2.5, 0.12, 0.12);
    const arm = new THREE.Mesh(armGeo, guardrailMat);
    arm.position.set(side * 1.0, 7.2, 0);
    lampGroup.add(arm);

    const fixGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
    const fixMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const fixture = new THREE.Mesh(fixGeo, fixMat);
    fixture.position.set(side * 2.0, 7.1, 0);
    lampGroup.add(fixture);

    chunk.add(lampGroup);
  }

  private addOverheadGantry(chunk: THREE.Group, z: number, signText: string) {
    const gantry = new THREE.Group();
    gantry.position.set(0, 0, z);

    const span = HIGHWAY_WIDTH + 5.0;
    const height = 7.5;

    // Uprights
    const postGeo = new THREE.CylinderGeometry(0.25, 0.25, height, 8);
    const leftPost = new THREE.Mesh(postGeo, guardrailMat);
    leftPost.position.set(-span * 0.5, height * 0.5, 0);
    gantry.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, guardrailMat);
    rightPost.position.set(span * 0.5, height * 0.5, 0);
    gantry.add(rightPost);

    // Cross truss
    const beamGeo = new THREE.BoxGeometry(span, 0.6, 0.6);
    const beam = new THREE.Mesh(beamGeo, guardrailMat);
    beam.position.set(0, height, 0);
    gantry.add(beam);

    // Green highway signboard
    const signGeo = new THREE.BoxGeometry(HIGHWAY_WIDTH * 0.65, 1.8, 0.15);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x065f46,
      roughness: 0.3,
      metalness: 0.2,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, height - 0.2, -0.3);
    gantry.add(sign);

    const borderGeo = new THREE.BoxGeometry(HIGHWAY_WIDTH * 0.63, 1.6, 0.16);
    const border = new THREE.Mesh(borderGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    border.position.set(0, height - 0.2, -0.31);
    gantry.add(border);

    chunk.add(gantry);
  }

  private spawnCoinsForChunk(chunk: THREE.Group, zCenter: number, chunkIndex: number) {
    const lane = Math.floor(Math.random() * 4);
    const laneX = LANE_X[lane];
    const coinCount = 3 + Math.floor(Math.random() * 2);
    const spacing = 7.0;

    for (let c = 0; c < coinCount; c++) {
      const coinMesh = createCoinMesh();
      const zOffset = -CHUNK_LENGTH * 0.3 + c * spacing;
      coinMesh.position.set(laneX, 0.9, zOffset);
      chunk.add(coinMesh);

      this.coins.push({
        mesh: coinMesh,
        lane,
        position: new THREE.Vector3(laneX, 0.9, zCenter + zOffset),
        collected: false,
        chunkIndex,
      });
    }
  }

  public update(playerZ: number, delta: number) {
    const time = performance.now() * 0.003;
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (!coin.collected && coin.mesh.visible) {
        coin.mesh.rotation.y += delta * 4.0;
        coin.mesh.position.y = 0.9 + Math.sin(time + i) * 0.15;
      }
    }

    const recycleThreshold = playerZ - CHUNK_LENGTH * 1.5;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.position.z < recycleThreshold) {
        const oldZ = chunk.position.z;
        chunk.position.z = this.nextChunkZ;
        const newZ = this.nextChunkZ;
        this.nextChunkZ += CHUNK_LENGTH;

        const chunkCoins = this.coins.filter((c) => c.chunkIndex === i);
        const newLane = Math.floor(Math.random() * 4);
        const laneX = LANE_X[newLane];

        chunkCoins.forEach((c, idx) => {
          c.collected = false;
          c.mesh.visible = true;
          c.lane = newLane;
          const zOffset = -CHUNK_LENGTH * 0.3 + idx * 7.0;
          c.mesh.position.set(laneX, 0.9, zOffset);
          c.position.set(laneX, 0.9, newZ + zOffset);
        });
      }
    }
  }

  public reset(playerZ: number = 0) {
    const startZ = playerZ - CHUNK_LENGTH;
    for (let i = 0; i < this.chunks.length; i++) {
      const zPos = startZ + i * CHUNK_LENGTH;
      this.chunks[i].position.z = zPos;
      const chunkCoins = this.coins.filter((c) => c.chunkIndex === i);
      const lane = Math.floor(Math.random() * 4);
      const laneX = LANE_X[lane];
      chunkCoins.forEach((c, idx) => {
        c.collected = false;
        c.mesh.visible = true;
        c.lane = lane;
        const zOffset = -CHUNK_LENGTH * 0.3 + idx * 7.0;
        c.mesh.position.set(laneX, 0.9, zOffset);
        c.position.set(laneX, 0.9, zPos + zOffset);
      });
    }
    this.nextChunkZ = startZ + CHUNKS_COUNT * CHUNK_LENGTH;
  }

  public setRoadWetness(wetness: number) {
    asphaltMat.roughness = THREE.MathUtils.lerp(0.85, 0.22, wetness);
    asphaltMat.metalness = THREE.MathUtils.lerp(0.10, 0.45, wetness);
    asphaltMat.color.lerpColors(
      new THREE.Color(this.currentMap.roadColor),
      new THREE.Color(0x0c0d0e),
      wetness
    );
  }
}
