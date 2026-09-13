import * as THREE from 'three';

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

  // Cylinder face
  const cylinderGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 18);
  cylinderGeo.rotateX(Math.PI / 2);
  const cylinder = new THREE.Mesh(cylinderGeo, coinMat);
  coinGroup.add(cylinder);

  // Rim ring
  const torusGeo = new THREE.TorusGeometry(0.52, 0.07, 8, 20);
  const torus = new THREE.Mesh(torusGeo, coinEdgeMat);
  coinGroup.add(torus);

  // Inner star/dollar emboss
  const innerGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);
  const inner = new THREE.Mesh(innerGeo, coinEdgeMat);
  coinGroup.add(inner);

  coinGroup.position.y = 0.9;
  return coinGroup;
}

export class HighwayEnvironment {
  public scene: THREE.Scene;
  public chunks: THREE.Group[] = [];
  public coins: CoinPickup[] = [];
  private nextChunkZ: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initChunks();
  }

  private initChunks() {
    // Start chunks from behind the player to well ahead
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

    // Left concrete barrier
    const leftBarrier = new THREE.Mesh(railGeo, concreteBarrierMat);
    leftBarrier.position.set(-HIGHWAY_WIDTH * 0.5 - 0.2, guardrailY, 0);
    chunk.add(leftBarrier);

    // Right metal guardrail
    const rightBarrier = new THREE.Mesh(railGeo, guardrailMat);
    rightBarrier.position.set(HIGHWAY_WIDTH * 0.5 + 0.2, guardrailY, 0);
    chunk.add(rightBarrier);

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

      // Yellow reflector square
      const refGeo = new THREE.PlaneGeometry(0.12, 0.12);
      const ref = new THREE.Mesh(refGeo, yellowLineMat);
      ref.position.set(-HIGHWAY_WIDTH * 0.5 - 0.05, 0.6, pz);
      ref.rotation.y = Math.PI / 2;
      chunk.add(ref);
    }

    // 5. Street Light Poles (every chunk has 2 street lamps)
    this.addStreetLamp(chunk, -HIGHWAY_WIDTH * 0.5 - 1.2, -CHUNK_LENGTH * 0.25, 1);
    this.addStreetLamp(chunk, HIGHWAY_WIDTH * 0.5 + 1.2, CHUNK_LENGTH * 0.25, -1);

    // 6. Overhead Highway Gantry (on every 3rd chunk)
    if (chunkIndex % 3 === 0) {
      this.addOverheadGantry(chunk, 0);
    }

    // 7. City Skyline Buildings on left and right
    this.addCityBuildings(chunk);

    return chunk;
  }

  private addStreetLamp(chunk: THREE.Group, x: number, z: number, side: number) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0, z);

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 7.5, 8);
    const pole = new THREE.Mesh(poleGeo, guardrailMat);
    pole.position.y = 3.75;
    lampGroup.add(pole);

    // Arm leaning towards highway
    const armGeo = new THREE.BoxGeometry(2.5, 0.12, 0.12);
    const arm = new THREE.Mesh(armGeo, guardrailMat);
    arm.position.set(side * 1.0, 7.2, 0);
    lampGroup.add(arm);

    // Light fixture
    const fixGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
    const fixMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const fixture = new THREE.Mesh(fixGeo, fixMat);
    fixture.position.set(side * 2.0, 7.1, 0);
    lampGroup.add(fixture);

    chunk.add(lampGroup);
  }

  private addOverheadGantry(chunk: THREE.Group, z: number) {
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
      color: 0x065f46, // Green highway sign
      roughness: 0.3,
      metalness: 0.2,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, height - 0.2, -0.3);
    gantry.add(sign);

    // Sign white border trim
    const borderGeo = new THREE.BoxGeometry(HIGHWAY_WIDTH * 0.63, 1.6, 0.16);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, height - 0.2, -0.31);
    gantry.add(border);

    chunk.add(gantry);
  }

  private addCityBuildings(chunk: THREE.Group) {
    const leftBuildingCount = 4;
    const rightBuildingCount = 4;

    // Left buildings
    for (let i = 0; i < leftBuildingCount; i++) {
      const bWidth = 14 + Math.random() * 12;
      const bDepth = 14 + Math.random() * 12;
      const bHeight = 35 + Math.random() * 65;
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];

      const building = new THREE.Mesh(bGeo, bMat);
      const posX = -HIGHWAY_WIDTH * 0.5 - 16 - Math.random() * 25;
      const posZ = -CHUNK_LENGTH * 0.5 + (i / leftBuildingCount) * CHUNK_LENGTH + (Math.random() * 10 - 5);
      building.position.set(posX, bHeight * 0.5, posZ);
      chunk.add(building);

      // Add a few glowing window bands
      const windowRows = 5;
      for (let w = 0; w < windowRows; w++) {
        const winGeo = new THREE.BoxGeometry(bWidth * 0.8, 0.45, bDepth + 0.1);
        const winMat = windowGlowMaterials[Math.floor(Math.random() * windowGlowMaterials.length)];
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(posX, 6 + w * 7, posZ);
        chunk.add(win);
      }
    }

    // Right buildings
    for (let i = 0; i < rightBuildingCount; i++) {
      const bWidth = 14 + Math.random() * 12;
      const bDepth = 14 + Math.random() * 12;
      const bHeight = 30 + Math.random() * 60;
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];

      const building = new THREE.Mesh(bGeo, bMat);
      const posX = HIGHWAY_WIDTH * 0.5 + 16 + Math.random() * 25;
      const posZ = -CHUNK_LENGTH * 0.5 + (i / rightBuildingCount) * CHUNK_LENGTH + (Math.random() * 10 - 5);
      building.position.set(posX, bHeight * 0.5, posZ);
      chunk.add(building);

      const windowRows = 4;
      for (let w = 0; w < windowRows; w++) {
        const winGeo = new THREE.BoxGeometry(bWidth * 0.8, 0.45, bDepth + 0.1);
        const winMat = windowGlowMaterials[Math.floor(Math.random() * windowGlowMaterials.length)];
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(posX, 5 + w * 8, posZ);
        chunk.add(win);
      }
    }
  }

  private spawnCoinsForChunk(chunk: THREE.Group, zCenter: number, chunkIndex: number) {
    // 2 to 4 coins per chunk in a lane line
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
    // Spin and bob all active coins
    const time = performance.now() * 0.003;
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (!coin.collected && coin.mesh.visible) {
        coin.mesh.rotation.y += delta * 4.0;
        coin.mesh.position.y = 0.9 + Math.sin(time + i) * 0.15;
      }
    }

    // Check if the furthest chunk behind player needs recycling
    const recycleThreshold = playerZ - CHUNK_LENGTH * 1.5;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.position.z < recycleThreshold) {
        // Recycle chunk to the front
        const oldZ = chunk.position.z;
        chunk.position.z = this.nextChunkZ;
        const newZ = this.nextChunkZ;
        this.nextChunkZ += CHUNK_LENGTH;

        // Reset and reposition coins belonging to this chunk
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
}
