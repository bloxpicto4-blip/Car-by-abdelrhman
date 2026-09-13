import * as THREE from 'three';
import { LANE_X } from './environment';
import { buildTrafficVehicle, TrafficMeshBundle, TrafficType, setBrakeLights } from './carBuilder';

export interface TrafficCarInstance {
  id: number;
  bundle: TrafficMeshBundle;
  type: TrafficType;
  lane: number;
  targetLane: number;
  x: number;
  y: number;
  z: number;
  speedMs: number; // in m/s (e.g. 20m/s = 72 km/h, 35m/s = 126 km/h)
  targetSpeedMs: number;
  isLaneChanging: boolean;
  laneChangeProgress: number;
  laneChangeStartX: number;
  laneChangeTargetX: number;
  nearMissRecorded: boolean;
  blinkTimer: number;
  isBraking: boolean;
}

export class TrafficManager {
  public scene: THREE.Scene;
  public traffic: TrafficCarInstance[] = [];
  private nextId: number = 1;
  private maxVehicles: number = 12; // Balanced density for high performance on Android & desktop

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public initTraffic(playerZ: number) {
    this.clearTraffic();
    // Spawn initial wave of traffic ahead of player (40m to 200m ahead)
    for (let i = 0; i < this.maxVehicles; i++) {
      const zOffset = 35 + i * 16 + Math.random() * 8;
      this.spawnCar(playerZ + zOffset);
    }
  }

  public clearTraffic() {
    for (let i = 0; i < this.traffic.length; i++) {
      this.scene.remove(this.traffic[i].bundle.group);
    }
    this.traffic = [];
  }

  private spawnCar(z: number): TrafficCarInstance | null {
    // Select random lane (0 to 3)
    const lane = Math.floor(Math.random() * 4);
    const x = LANE_X[lane];

    // Pick vehicle type based on lane
    let type: TrafficType = 'sedan';
    const rand = Math.random();
    if (lane === 0 || lane === 3) {
      // Outer lanes have more trucks and SUVs
      if (rand < 0.45) type = 'truck';
      else if (rand < 0.75) type = 'suv';
      else type = 'sedan';
    } else {
      // Inner lanes have faster sedans and sports coupes
      if (rand < 0.45) type = 'sport';
      else if (rand < 0.8) type = 'sedan';
      else type = 'suv';
    }

    // Determine speed based on type and lane
    let speedKmh = 75 + Math.random() * 20; // default 75-95 km/h
    if (type === 'truck') speedKmh = 65 + Math.random() * 15; // 65-80 km/h
    else if (type === 'sport') speedKmh = 105 + Math.random() * 25; // 105-130 km/h
    else if (lane === 1 || lane === 2) speedKmh = 90 + Math.random() * 25; // fast passing lanes

    const speedMs = speedKmh / 3.6;

    // Check if spawn location is not too close to another vehicle in the same lane
    const tooClose = this.traffic.some(
      (c) => Math.abs(c.x - x) < 2.0 && Math.abs(c.z - z) < 22
    );
    if (tooClose) return null;

    const bundle = buildTrafficVehicle(type);
    bundle.group.position.set(x, 0, z);
    this.scene.add(bundle.group);

    const car: TrafficCarInstance = {
      id: this.nextId++,
      bundle,
      type,
      lane,
      targetLane: lane,
      x,
      y: 0,
      z,
      speedMs,
      targetSpeedMs: speedMs,
      isLaneChanging: false,
      laneChangeProgress: 0,
      laneChangeStartX: x,
      laneChangeTargetX: x,
      nearMissRecorded: false,
      blinkTimer: 0,
      isBraking: false,
    };

    this.traffic.push(car);
    return car;
  }

  public update(playerZ: number, playerX: number, playerSpeedMs: number, delta: number) {
    // Sort traffic by Z to check vehicles ahead
    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];

      // Forward movement
      car.z += car.speedMs * delta;

      // Check distance to car directly ahead in same lane
      let carAhead: TrafficCarInstance | null = null;
      let minDistance = Infinity;

      for (let j = 0; j < this.traffic.length; j++) {
        if (i === j) continue;
        const other = this.traffic[j];
        if (other.lane === car.lane && other.z > car.z) {
          const dist = other.z - car.z;
          if (dist < minDistance) {
            minDistance = dist;
            carAhead = other;
          }
        }
      }

      // Traffic AI Braking logic
      const safeDistance = car.type === 'truck' ? 22 : 16;
      if (carAhead && minDistance < safeDistance) {
        car.targetSpeedMs = Math.max(carAhead.speedMs * 0.9, 12);
        car.speedMs = THREE.MathUtils.lerp(car.speedMs, car.targetSpeedMs, delta * 2.5);
        car.isBraking = true;
      } else {
        car.speedMs = THREE.MathUtils.lerp(car.speedMs, car.targetSpeedMs, delta * 0.8);
        car.isBraking = false;
      }

      setBrakeLights(car.bundle.brakeLights, car.isBraking);

      // Lane changing behavior
      if (!car.isLaneChanging) {
        // Occasionally initiate lane change if blocked or just cruising
        if (Math.random() < 0.003 && car.type !== 'truck') {
          this.attemptLaneChange(car);
        }
      } else {
        car.laneChangeProgress += delta * 0.6; // ~1.6 seconds to change lane
        const t = Math.min(1.0, car.laneChangeProgress);
        // Smooth sine ease
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
        car.x = THREE.MathUtils.lerp(car.laneChangeStartX, car.laneChangeTargetX, ease);

        // Turn wheels slightly during lane change
        const steerAngle = (car.laneChangeTargetX > car.laneChangeStartX ? 0.2 : -0.2) * Math.sin(Math.PI * t);
        car.bundle.wheels.forEach((w) => (w.rotation.y = steerAngle));

        if (t >= 1.0) {
          car.isLaneChanging = false;
          car.lane = car.targetLane;
          car.x = LANE_X[car.lane];
          car.bundle.wheels.forEach((w) => (w.rotation.y = 0));
        }
      }

      // Rotate wheels forward with velocity
      const wheelCircumference = 2.1;
      const wheelRoll = (car.speedMs * delta * Math.PI * 2) / wheelCircumference;
      car.bundle.wheels.forEach((w) => (w.rotation.x += wheelRoll));

      car.bundle.group.position.set(car.x, car.y, car.z);

      // Despawn vehicles falling far behind player or too far ahead
      if (car.z < playerZ - 45 || car.z > playerZ + 280) {
        this.recycleCar(car, playerZ);
      }
    }

    // Maintain target population
    if (this.traffic.length < this.maxVehicles) {
      const spawnZ = playerZ + 110 + Math.random() * 80;
      this.spawnCar(spawnZ);
    }
  }

  private attemptLaneChange(car: TrafficCarInstance) {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const targetLane = car.lane + direction;
    if (targetLane < 0 || targetLane > 3) return;

    const targetX = LANE_X[targetLane];
    // Check if target lane is clear near this car
    const isTargetOccupied = this.traffic.some(
      (c) => c.id !== car.id && Math.abs(c.lane - targetLane) === 0 && Math.abs(c.z - car.z) < 22
    );

    if (!isTargetOccupied) {
      car.isLaneChanging = true;
      car.laneChangeProgress = 0;
      car.laneChangeStartX = car.x;
      car.laneChangeTargetX = targetX;
      car.targetLane = targetLane;
    }
  }

  public onHornAlert(playerZ: number, playerLane: number) {
    // Vehicles ahead in player's lane attempt to move out of the way!
    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];
      if (car.lane === playerLane && car.z > playerZ && car.z < playerZ + 55 && !car.isLaneChanging) {
        // Try to move away from player lane
        const preferLane = playerLane <= 1 ? playerLane + 1 : playerLane - 1;
        if (preferLane >= 0 && preferLane <= 3) {
          const clear = !this.traffic.some(
            (c) => c.id !== car.id && c.lane === preferLane && Math.abs(c.z - car.z) < 18
          );
          if (clear) {
            car.isLaneChanging = true;
            car.laneChangeProgress = 0;
            car.laneChangeStartX = car.x;
            car.laneChangeTargetX = LANE_X[preferLane];
            car.targetLane = preferLane;
          }
        }
      }
    }
  }

  private recycleCar(car: TrafficCarInstance, playerZ: number) {
    // Reposition car far ahead of player
    const spawnZ = playerZ + 130 + Math.random() * 90;
    const newLane = Math.floor(Math.random() * 4);
    const newX = LANE_X[newLane];

    car.lane = newLane;
    car.targetLane = newLane;
    car.x = newX;
    car.z = spawnZ;
    car.isLaneChanging = false;
    car.nearMissRecorded = false;
    car.isBraking = false;

    let speedKmh = 80 + Math.random() * 25;
    if (car.type === 'truck') speedKmh = 68 + Math.random() * 12;
    else if (car.type === 'sport') speedKmh = 110 + Math.random() * 25;
    car.speedMs = speedKmh / 3.6;
    car.targetSpeedMs = car.speedMs;

    car.bundle.group.position.set(car.x, car.y, car.z);
    setBrakeLights(car.bundle.brakeLights, false);
  }

  public checkNearMiss(
    playerX: number,
    playerZ: number,
    playerLength: number,
    playerWidth: number,
    playerSpeedKmh: number
  ): { count: number; bonusScore: number; bonusCoins: number } | null {
    if (playerSpeedKmh < 80) return null; // Near misses only count when driving fast!

    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];
      if (car.nearMissRecorded) continue;

      // Check longitudinal alignment (player passing alongside car)
      const longitudinalDist = Math.abs(car.z - playerZ);
      const combinedHalfLength = (playerLength + car.bundle.length) * 0.5;

      if (longitudinalDist < combinedHalfLength + 0.8) {
        // Lateral distance between centers
        const lateralDist = Math.abs(car.x - playerX);
        const combinedHalfWidth = (playerWidth + car.bundle.width) * 0.5;

        // Near-miss trigger zone: close scrape between 0.2m and 1.35m edge clearance
        const edgeClearance = lateralDist - combinedHalfWidth;
        if (edgeClearance > 0.15 && edgeClearance < 1.35) {
          car.nearMissRecorded = true;
          // Calculate score scaled with speed
          const speedMultiplier = Math.max(1, Math.floor(playerSpeedKmh / 100));
          const bonusScore = 150 * speedMultiplier;
          const bonusCoins = 15 * speedMultiplier;

          return { count: 1, bonusScore, bonusCoins };
        }
      }
    }
    return null;
  }

  public checkCollisions(
    playerX: number,
    playerZ: number,
    playerLength: number,
    playerWidth: number
  ): { hasCollided: boolean; trafficCar?: TrafficCarInstance; overlapX: number; overlapZ: number } {
    const halfPlayerW = playerWidth * 0.44; // slight safety inset for arcade forgiveness
    const halfPlayerL = playerLength * 0.44;

    for (let i = 0; i < this.traffic.length; i++) {
      const car = this.traffic[i];
      const halfTrafficW = car.bundle.width * 0.45;
      const halfTrafficL = car.bundle.length * 0.45;

      const dx = Math.abs(playerX - car.x);
      const dz = Math.abs(playerZ - car.z);

      const overlapX = halfPlayerW + halfTrafficW - dx;
      const overlapZ = halfPlayerL + halfTrafficL - dz;

      if (overlapX > 0 && overlapZ > 0) {
        return {
          hasCollided: true,
          trafficCar: car,
          overlapX,
          overlapZ,
        };
      }
    }

    return { hasCollided: false, overlapX: 0, overlapZ: 0 };
  }
}
