import * as THREE from 'three';
import { TrafficLightState, TrafficSignalTelemetry } from '../types';
import { HIGHWAY_WIDTH, LANE_X } from './environment';

interface SignalHeadMesh {
  group: THREE.Group;
  redMesh: THREE.Mesh;
  yellowMesh: THREE.Mesh;
  greenMesh: THREE.Mesh;
}

export interface TrafficLightGantry {
  id: number;
  group: THREE.Group;
  z: number;
  state: TrafficLightState;
  timer: number;
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  heads: SignalHeadMesh[];
  gantryLight: THREE.PointLight;
  stopBarMesh: THREE.Mesh;
  hasPlayerClearedDuringRed: boolean;
}

// Materials for active and dormant lenses
const gantrySteelMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  metalness: 0.85,
  roughness: 0.35,
});

const housingMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.7,
  metalness: 0.3,
});

const hazardMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.5,
});

// Emissive lenses
const redActiveMat = new THREE.MeshStandardMaterial({
  color: 0xff3333,
  emissive: 0xff0000,
  emissiveIntensity: 3.2,
  roughness: 0.2,
});

const redDormantMat = new THREE.MeshStandardMaterial({
  color: 0x3b0707,
  emissive: 0x1a0303,
  emissiveIntensity: 0.15,
  roughness: 0.6,
});

const yellowActiveMat = new THREE.MeshStandardMaterial({
  color: 0xffbb22,
  emissive: 0xf59e0b,
  emissiveIntensity: 2.8,
  roughness: 0.2,
});

const yellowDormantMat = new THREE.MeshStandardMaterial({
  color: 0x451a03,
  emissive: 0x1f0d01,
  emissiveIntensity: 0.15,
  roughness: 0.6,
});

const greenActiveMat = new THREE.MeshStandardMaterial({
  color: 0x22c55e,
  emissive: 0x10b981,
  emissiveIntensity: 2.8,
  roughness: 0.2,
});

const greenDormantMat = new THREE.MeshStandardMaterial({
  color: 0x022c22,
  emissive: 0x01140e,
  emissiveIntensity: 0.15,
  roughness: 0.6,
});

const stopLineMat = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.85,
});

export class TrafficLightManager {
  private scene: THREE.Scene;
  public gantries: TrafficLightGantry[] = [];
  private nextSignalZ: number = 320;
  private readonly signalInterval: number = 400; // Signal every 400m
  private readonly maxGantries: number = 3;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public init(playerZ: number) {
    this.clear();
    this.nextSignalZ = playerZ + 280;

    for (let i = 0; i < this.maxGantries; i++) {
      const z = this.nextSignalZ;
      this.nextSignalZ += this.signalInterval;

      // Stagger phases: first signal green, second turning red, third red
      let initialState: TrafficLightState = 'green';
      let initialTimer = 0;
      if (i === 0) {
        initialState = 'green';
        initialTimer = 6; // Green for ~12s more
      } else if (i === 1) {
        initialState = 'yellow';
        initialTimer = 1;
      } else {
        initialState = 'red';
        initialTimer = 4;
      }

      this.createGantry(z, initialState, initialTimer);
    }
  }

  public clear() {
    for (let i = 0; i < this.gantries.length; i++) {
      this.scene.remove(this.gantries[i].group);
    }
    this.gantries = [];
  }

  private createGantry(z: number, initialState: TrafficLightState, initialTimer: number = 0): TrafficLightGantry {
    const group = new THREE.Group();
    group.position.set(0, 0, z);

    const span = HIGHWAY_WIDTH + 4.8;
    const height = 7.6;

    // 1. Dual Support Pillars on left and right road borders
    [-span * 0.5, span * 0.5].forEach((px) => {
      // Main steel pole
      const pillarGeo = new THREE.CylinderGeometry(0.24, 0.28, height, 12);
      const pillar = new THREE.Mesh(pillarGeo, gantrySteelMat);
      pillar.position.set(px, height * 0.5, 0);
      pillar.castShadow = true;
      group.add(pillar);

      // Hazard base collar with amber striping
      const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 1.2, 12);
      const baseCollar = new THREE.Mesh(baseGeo, hazardMat);
      baseCollar.position.set(px, 0.6, 0);
      group.add(baseCollar);
    });

    // 2. Overhead Truss Beams (twin horizontal bars with cross-bracing feel)
    const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.35, 0.45), gantrySteelMat);
    upperBeam.position.set(0, height, 0);
    group.add(upperBeam);

    const lowerBeam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.25, 0.35), gantrySteelMat);
    lowerBeam.position.set(0, height - 1.2, 0);
    group.add(lowerBeam);

    // Diagonal truss struts
    const strutCount = 6;
    for (let s = 0; s < strutCount; s++) {
      const sx = -span * 0.4 + (s / (strutCount - 1)) * (span * 0.8);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), gantrySteelMat);
      strut.position.set(sx, height - 0.6, 0);
      strut.rotation.z = s % 2 === 0 ? 0.35 : -0.35;
      group.add(strut);
    }

    // 3. Overhead Highway Digital Warning Signboard
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 1.1, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
    );
    signBoard.position.set(0, height + 0.7, -0.15);
    group.add(signBoard);

    // Sign text strip / LED matrix frame
    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.85, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    ledStrip.position.set(0, height + 0.7, -0.16);
    group.add(ledStrip);

    // 4. Traffic Signal Heads for each of the 4 highway lanes
    const heads: SignalHeadMesh[] = [];

    LANE_X.forEach((laneX) => {
      const headGroup = new THREE.Group();
      headGroup.position.set(laneX, height - 0.6, -0.2);

      // Housing Box
      const boxW = 0.58;
      const boxH = 1.45;
      const boxD = 0.38;
      const box = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), housingMat);
      headGroup.add(box);

      // Yellow border backplate for maximum road visibility
      const backPlate = new THREE.Mesh(new THREE.BoxGeometry(boxW + 0.14, boxH + 0.14, 0.05), hazardMat);
      backPlate.position.set(0, 0, -boxD * 0.5 - 0.02);
      headGroup.add(backPlate);

      // 3 Lenses: Red (top: y=0.4), Yellow (mid: y=0), Green (bot: y=-0.4)
      const lensRadius = 0.16;

      const createLens = (y: number, dormantMat: THREE.Material) => {
        const lensGeo = new THREE.CylinderGeometry(lensRadius, lensRadius, 0.08, 16);
        lensGeo.rotateX(Math.PI / 2);
        const lensMesh = new THREE.Mesh(lensGeo, dormantMat);
        lensMesh.position.set(0, y, -boxD * 0.5 - 0.04);

        // Sun visor hood
        const visorGeo = new THREE.CylinderGeometry(lensRadius + 0.025, lensRadius + 0.035, 0.18, 12, 1, true, 0, Math.PI);
        visorGeo.rotateX(Math.PI / 2);
        const visor = new THREE.Mesh(visorGeo, housingMat);
        visor.position.set(0, y, -boxD * 0.5 - 0.08);
        headGroup.add(visor);

        headGroup.add(lensMesh);
        return lensMesh;
      };

      const redMesh = createLens(0.42, redDormantMat);
      const yellowMesh = createLens(0.0, yellowDormantMat);
      const greenMesh = createLens(-0.42, greenDormantMat);

      group.add(headGroup);
      heads.push({ group: headGroup, redMesh, yellowMesh, greenMesh });
    });

    // 5. Downward PointLight for night/dusk environmental illumination
    const gantryLight = new THREE.PointLight(0x22c55e, 1.8, 28);
    gantryLight.position.set(0, height - 1.2, -3.0);
    group.add(gantryLight);

    // 6. Transverse White Stop Bar painted on asphalt at z = -4.5m
    const stopBarGeo = new THREE.PlaneGeometry(HIGHWAY_WIDTH * 0.96, 1.1);
    stopBarGeo.rotateX(-Math.PI / 2);
    const stopBarMesh = new THREE.Mesh(stopBarGeo, stopLineMat);
    stopBarMesh.position.set(0, 0.025, -4.5);
    group.add(stopBarMesh);

    // Dashed advance hazard warning line at z = -9.5m
    const warningLineGeo = new THREE.PlaneGeometry(HIGHWAY_WIDTH * 0.94, 0.35);
    warningLineGeo.rotateX(-Math.PI / 2);
    const warningLine = new THREE.Mesh(warningLineGeo, hazardMat);
    warningLine.position.set(0, 0.025, -9.5);
    group.add(warningLine);

    this.scene.add(group);

    const gantry: TrafficLightGantry = {
      id: Math.floor(Math.random() * 100000),
      group,
      z,
      state: initialState,
      timer: initialTimer,
      greenDuration: 18 + Math.random() * 4,
      yellowDuration: 4.0,
      redDuration: 14 + Math.random() * 4,
      heads,
      gantryLight,
      stopBarMesh,
      hasPlayerClearedDuringRed: false,
    };

    this.applySignalMaterials(gantry);
    this.gantries.push(gantry);
    return gantry;
  }

  private applySignalMaterials(gantry: TrafficLightGantry) {
    const isGreen = gantry.state === 'green';
    const isYellow = gantry.state === 'yellow';
    const isRed = gantry.state === 'red';

    gantry.heads.forEach((h) => {
      h.redMesh.material = isRed ? redActiveMat : redDormantMat;
      h.yellowMesh.material = isYellow ? yellowActiveMat : yellowDormantMat;
      h.greenMesh.material = isGreen ? greenActiveMat : greenDormantMat;
    });

    if (isRed) {
      gantry.gantryLight.color.setHex(0xef4444);
      gantry.gantryLight.intensity = 2.4;
    } else if (isYellow) {
      gantry.gantryLight.color.setHex(0xf59e0b);
      gantry.gantryLight.intensity = 2.0;
    } else {
      gantry.gantryLight.color.setHex(0x10b981);
      gantry.gantryLight.intensity = 1.8;
    }
  }

  public update(playerZ: number, delta: number): {
    stateChanged: boolean;
    changedGantry?: TrafficLightGantry;
    clearedRedLight?: boolean;
  } {
    let stateChanged = false;
    let changedGantry: TrafficLightGantry | undefined;
    let clearedRedLight = false;

    // 1. Update signal state machines
    for (let i = 0; i < this.gantries.length; i++) {
      const gantry = this.gantries[i];
      gantry.timer += delta;

      let prevState = gantry.state;

      if (gantry.state === 'green') {
        if (gantry.timer >= gantry.greenDuration) {
          gantry.state = 'yellow';
          gantry.timer = 0;
          this.applySignalMaterials(gantry);
          stateChanged = true;
          changedGantry = gantry;
        }
      } else if (gantry.state === 'yellow') {
        if (gantry.timer >= gantry.yellowDuration) {
          gantry.state = 'red';
          gantry.timer = 0;
          gantry.hasPlayerClearedDuringRed = false; // reset for this red phase
          this.applySignalMaterials(gantry);
          stateChanged = true;
          changedGantry = gantry;
        }
      } else if (gantry.state === 'red') {
        if (gantry.timer >= gantry.redDuration) {
          gantry.state = 'green';
          gantry.timer = 0;
          this.applySignalMaterials(gantry);
          stateChanged = true;
          changedGantry = gantry;
        }
      }

      // Check if player safely crosses the red light stop bar during red phase
      if (
        gantry.state === 'red' &&
        !gantry.hasPlayerClearedDuringRed &&
        playerZ >= gantry.z - 4.5 &&
        playerZ <= gantry.z + 10
      ) {
        gantry.hasPlayerClearedDuringRed = true;
        clearedRedLight = true;
      }
    }

    // 2. Recycle gantries falling far behind player
    const recycleThreshold = playerZ - 90;
    for (let i = 0; i < this.gantries.length; i++) {
      const gantry = this.gantries[i];
      if (gantry.z < recycleThreshold) {
        const newZ = this.nextSignalZ;
        this.nextSignalZ += this.signalInterval;

        gantry.z = newZ;
        gantry.group.position.z = newZ;
        gantry.hasPlayerClearedDuringRed = false;

        // Alternate cycles for variety: 50% chance red or changing
        const rand = Math.random();
        if (rand < 0.4) {
          gantry.state = 'red';
          gantry.timer = Math.random() * 4;
        } else if (rand < 0.65) {
          gantry.state = 'yellow';
          gantry.timer = Math.random() * 2;
        } else {
          gantry.state = 'green';
          gantry.timer = Math.random() * 6;
        }
        this.applySignalMaterials(gantry);
      }
    }

    return { stateChanged, changedGantry, clearedRedLight };
  }

  public getNearestSignalAhead(playerZ: number): { gantry: TrafficLightGantry; distance: number } | null {
    let nearest: TrafficLightGantry | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.gantries.length; i++) {
      const gantry = this.gantries[i];
      const dist = gantry.z - playerZ;
      if (dist > -10 && dist < minDistance) {
        minDistance = dist;
        nearest = gantry;
      }
    }

    if (!nearest) return null;
    return { gantry: nearest, distance: minDistance };
  }

  public getTelemetry(playerZ: number): TrafficSignalTelemetry | null {
    const nearest = this.getNearestSignalAhead(playerZ);
    if (!nearest || nearest.distance > 240) {
      return null;
    }

    const { gantry, distance } = nearest;
    let maxDuration = gantry.greenDuration;
    if (gantry.state === 'yellow') maxDuration = gantry.yellowDuration;
    if (gantry.state === 'red') maxDuration = gantry.redDuration;

    const timeRemaining = Math.max(0, maxDuration - gantry.timer);

    return {
      state: gantry.state,
      distanceMeters: Math.max(0, Math.round(distance)),
      isRed: gantry.state === 'red',
      timeRemaining: Math.round(timeRemaining),
    };
  }

  public reset(playerZ: number = 0) {
    this.init(playerZ);
  }
}
