import * as THREE from 'three';
import { CarDefinition, InputState, NearMissEvent, TelemetryData, Upgrades } from '../types';
import { CARS_CATALOG, computeEffectiveStats } from '../data/cars';
import { buildPlayerCar, CarMeshBundle, setBrakeLights } from './carBuilder';
import { HighwayEnvironment, HIGHWAY_WIDTH, LANE_X } from './environment';
import { TrafficManager } from './trafficManager';
import { sound } from '../utils/audio';

export interface GameEngineCallbacks {
  onTelemetry: (data: TelemetryData) => void;
  onNearMiss: (event: NearMissEvent) => void;
  onCoinCollected: (totalCoins: number, value: number) => void;
  onGameOver: (summary: {
    finalScore: number;
    distanceMeters: number;
    maxSpeedKmh: number;
    nearMisses: number;
    coinsEarned: number;
  }) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Environment & Systems
  private environment!: HighwayEnvironment;
  private trafficManager!: TrafficManager;
  private playerCarBundle: CarMeshBundle | null = null;
  private callbacks: GameEngineCallbacks;

  // Player Physics & State
  private playerX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private playerSpeedMs: number = 0;
  private playerSteerAngle: number = 0;
  private playerRoll: number = 0;
  private playerYaw: number = 0;

  // Stats for active car
  private activeCarDef: CarDefinition;
  private activeUpgrades: Upgrades;
  private effectiveStats: { topSpeed: number; acceleration: number; handling: number; braking: number };

  // Gameplay Run Stats
  private distanceTraveled: number = 0;
  private currentScore: number = 0;
  private coinsEarnedThisRun: number = 0;
  private nearMissesCount: number = 0;
  private maxSpeedAchievedKmh: number = 0;
  private nitroCharge: number = 80; // 0 to 100%
  private isNitroActive: boolean = false;
  private isCrashing: boolean = false;
  private crashTimer: number = 0;
  private crashAngularVel = new THREE.Vector3();
  private crashLinearVel = new THREE.Vector3();

  // Inputs
  private input: InputState = {
    steerLeft: false,
    steerRight: false,
    throttle: false,
    brake: false,
    nitro: false,
    horn: false,
    steerAxis: 0,
  };

  // Particles & Visual FX
  private sparksParticles: THREE.Points | null = null;
  private sparkPositions: Float32Array | null = null;
  private sparkVelocities: THREE.Vector3[] = [];
  private exhaustFlameLeft: THREE.Mesh | null = null;
  private exhaustFlameRight: THREE.Mesh | null = null;

  // Camera damping
  private currentCamPos = new THREE.Vector3(0, 3.4, -6.5);
  private currentLookTarget = new THREE.Vector3(0, 1.2, 8.0);
  private camShakeIntensity: number = 0;

  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.activeCarDef = CARS_CATALOG[0];
    this.activeUpgrades = { speedLevel: 1, accelLevel: 1, handlingLevel: 1, brakingLevel: 1 };
    this.effectiveStats = computeEffectiveStats(this.activeCarDef, this.activeUpgrades);

    this.initThree();
    this.initLighting();
    this.initFX();
    this.setupResize();
  }

  private initThree() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    // Exponential fog for deep horizon fade
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.0072);

    // Camera
    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 450);
    this.camera.position.set(0, 3.5, -6.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Initialize systems
    this.environment = new HighwayEnvironment(this.scene);
    this.trafficManager = new TrafficManager(this.scene);
  }

  private initLighting() {
    // Ambient light with midnight blue tint
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.3);
    this.scene.add(ambientLight);

    // Moonlight / Sunset Directional light
    const dirLight = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    dirLight.position.set(25, 45, -20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 130;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Subtle horizon sun flare / city backlight
    const skyLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.9);
    this.scene.add(skyLight);
  }

  private initFX() {
    // 1. Sparks particle system for scrapes and crashes
    const maxSparks = 60;
    const sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(maxSparks * 3);
    this.sparkVelocities = [];

    for (let i = 0; i < maxSparks; i++) {
      this.sparkPositions[i * 3] = 0;
      this.sparkPositions[i * 3 + 1] = -100; // hidden initially
      this.sparkPositions[i * 3 + 2] = 0;
      this.sparkVelocities.push(new THREE.Vector3());
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.28,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });

    this.sparksParticles = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(this.sparksParticles);

    // 2. Nitro Flames
    const flameGeo = new THREE.ConeGeometry(0.12, 0.7, 8);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Cyan nitro flame
      transparent: true,
      opacity: 0.85,
    });

    this.exhaustFlameLeft = new THREE.Mesh(flameGeo, flameMat);
    this.exhaustFlameRight = new THREE.Mesh(flameGeo, flameMat);
    this.exhaustFlameLeft.visible = false;
    this.exhaustFlameRight.visible = false;
    this.scene.add(this.exhaustFlameLeft);
    this.scene.add(this.exhaustFlameRight);
  }

  private emitSparks(origin: THREE.Vector3, count: number = 8, spreadDir = new THREE.Vector3(0, 1, -1)) {
    if (!this.sparkPositions || !this.sparksParticles) return;

    let emitted = 0;
    for (let i = 0; i < this.sparkVelocities.length && emitted < count; i++) {
      if (this.sparkPositions[i * 3 + 1] < -50) {
        this.sparkPositions[i * 3] = origin.x + (Math.random() - 0.5) * 0.3;
        this.sparkPositions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.3;
        this.sparkPositions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.3;

        this.sparkVelocities[i].set(
          spreadDir.x + (Math.random() - 0.5) * 3.5,
          spreadDir.y + Math.random() * 4.0,
          spreadDir.z - Math.random() * 6.0
        );
        emitted++;
      }
    }
    this.sparksParticles.geometry.attributes.position.needsUpdate = true;
  }

  private updateSparks(delta: number) {
    if (!this.sparkPositions || !this.sparksParticles) return;
    let anyActive = false;

    for (let i = 0; i < this.sparkVelocities.length; i++) {
      if (this.sparkPositions[i * 3 + 1] > -50) {
        anyActive = true;
        this.sparkPositions[i * 3] += this.sparkVelocities[i].x * delta;
        this.sparkPositions[i * 3 + 1] += this.sparkVelocities[i].y * delta;
        this.sparkPositions[i * 3 + 2] += this.sparkVelocities[i].z * delta;

        // Gravity
        this.sparkVelocities[i].y -= 12.0 * delta;

        // Ground bounce or expire
        if (this.sparkPositions[i * 3 + 1] <= 0.1) {
          this.sparkPositions[i * 3 + 1] = -100;
        }
      }
    }
    if (anyActive) {
      this.sparksParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  public setCar(carDef: CarDefinition, paintHex: string, upgrades: Upgrades) {
    this.activeCarDef = carDef;
    this.activeUpgrades = upgrades;
    this.effectiveStats = computeEffectiveStats(carDef, upgrades);

    if (this.playerCarBundle) {
      this.scene.remove(this.playerCarBundle.group);
    }

    this.playerCarBundle = buildPlayerCar(carDef, paintHex);
    this.scene.add(this.playerCarBundle.group);
  }

  public setInput(input: Partial<InputState>) {
    this.input = { ...this.input, ...input };

    if (this.input.horn) {
      sound.startHorn();
      const currentLane = this.getCurrentLaneIndex();
      this.trafficManager.onHornAlert(this.playerZ, currentLane);
    } else {
      sound.stopHorn();
    }
  }

  private getCurrentLaneIndex(): number {
    let closestLane = 0;
    let minDist = Infinity;
    for (let i = 0; i < LANE_X.length; i++) {
      const d = Math.abs(this.playerX - LANE_X[i]);
      if (d < minDist) {
        minDist = d;
        closestLane = i;
      }
    }
    return closestLane;
  }

  public startRace() {
    this.isRunning = true;
    this.isPaused = false;
    this.isCrashing = false;
    this.crashTimer = 0;

    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.playerSpeedMs = 0;
    this.playerSteerAngle = 0;
    this.playerRoll = 0;
    this.playerYaw = 0;

    this.distanceTraveled = 0;
    this.currentScore = 0;
    this.coinsEarnedThisRun = 0;
    this.nearMissesCount = 0;
    this.maxSpeedAchievedKmh = 0;
    this.nitroCharge = 85;
    this.isNitroActive = false;

    this.environment.reset(0);
    this.trafficManager.initTraffic(0);

    if (this.playerCarBundle) {
      this.playerCarBundle.group.position.set(0, 0, 0);
      this.playerCarBundle.group.rotation.set(0, 0, 0);
      setBrakeLights(this.playerCarBundle.brakeLights, false);
    }

    this.currentCamPos.set(0, 3.4, -6.5);
    this.currentLookTarget.set(0, 1.2, 8.0);

    sound.startEngine();

    this.lastTime = performance.now();
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      sound.stopEngine();
    } else if (this.isRunning && !this.isCrashing) {
      sound.startEngine();
    }
  }

  public stopRace() {
    this.isRunning = false;
    sound.stopEngine();
    sound.stopHorn();
  }

  private loop(now: number) {
    this.animFrameId = requestAnimationFrame(this.loop.bind(this));

    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isRunning || this.isPaused) {
      // Still render scene (e.g. for garage turntable or pause)
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.isCrashing) {
      this.updateCrashPhysics(delta);
    } else {
      this.updatePlayerPhysics(delta);
      this.updateCollisionsAndPrizes(delta);
    }

    // Update Highway and Traffic
    this.environment.update(this.playerZ, delta);
    this.trafficManager.update(this.playerZ, this.playerX, this.playerSpeedMs, delta);
    this.updateSparks(delta);
    this.updateCamera(delta);
    this.updateAudioAndTelemetry();

    this.renderer.render(this.scene, this.camera);
  }

  private updatePlayerPhysics(delta: number) {
    const maxSpeedKmh = this.effectiveStats.topSpeed;
    const accelRate = (3.5 + this.effectiveStats.acceleration * 1.0) * 1.7; // acceleration in m/s^2
    const brakeRate = (5.0 + this.effectiveStats.braking * 1.2) * 2.2;
    const dragCoeff = 0.00065; // aerodynamic drag
    const rollingResistance = 1.2;

    const maxSpeedMs = (maxSpeedKmh / 3.6);
    const nitroBoostMs = (42 / 3.6); // +42 km/h during nitro

    // Throttle & Nitro
    const isThrottle = this.input.throttle || (!this.input.brake && this.playerSpeedMs < 15); // gentle idle roll
    const canNitro = this.input.nitro && this.nitroCharge > 5 && this.playerSpeedMs > 15;

    if (canNitro) {
      if (!this.isNitroActive) {
        sound.playNitro();
        this.isNitroActive = true;
      }
      this.nitroCharge = Math.max(0, this.nitroCharge - delta * 24); // drains over ~4s
    } else {
      this.isNitroActive = false;
      // Nitro slowly charges above 110 km/h
      if (this.playerSpeedMs * 3.6 > 110) {
        this.nitroCharge = Math.min(100, this.nitroCharge + delta * 3.5);
      }
    }

    let targetMaxSpeed = maxSpeedMs;
    if (this.isNitroActive) {
      targetMaxSpeed += nitroBoostMs;
    }

    if (this.input.brake) {
      // Braking
      this.playerSpeedMs = Math.max(0, this.playerSpeedMs - brakeRate * delta);
      if (this.playerSpeedMs > 25 && Math.random() < 0.2) {
        sound.playScreech();
      }
    } else if (isThrottle) {
      // Accelerate
      const accelFactor = Math.max(0.2, 1.0 - this.playerSpeedMs / targetMaxSpeed);
      const nitroMultiplier = this.isNitroActive ? 1.6 : 1.0;
      this.playerSpeedMs += accelRate * accelFactor * nitroMultiplier * delta;
      this.playerSpeedMs = Math.min(this.playerSpeedMs, targetMaxSpeed);
    } else {
      // Coasting with natural drag
      const drag = dragCoeff * this.playerSpeedMs * this.playerSpeedMs + rollingResistance;
      this.playerSpeedMs = Math.max(0, this.playerSpeedMs - drag * delta);
    }

    // Steering
    // Calculate steer input from keys or axis
    let steerDir = 0;
    if (this.input.steerLeft) steerDir -= 1;
    if (this.input.steerRight) steerDir += 1;
    if (Math.abs(this.input.steerAxis) > 0.05) {
      steerDir = this.input.steerAxis;
    }

    // Handling responsiveness
    const handlingAgility = 4.2 + this.effectiveStats.handling * 0.7;
    // Grip scales smoothly with speed to prevent erratic twitching at 250km/h
    const speedRatio = Math.min(1.0, this.playerSpeedMs / 25);
    const highSpeedStability = 1.0 - Math.min(0.35, (this.playerSpeedMs / maxSpeedMs) * 0.35);

    const targetSteerAngle = steerDir * 0.42 * highSpeedStability;
    this.playerSteerAngle = THREE.MathUtils.lerp(this.playerSteerAngle, targetSteerAngle, delta * 9.0);

    const lateralSpeed = steerDir * handlingAgility * speedRatio;
    this.playerX += lateralSpeed * delta;

    // Road Bounds & Guardrail collision
    const maxRoadX = HIGHWAY_WIDTH * 0.5 - 0.9;
    if (this.playerX < -maxRoadX) {
      this.playerX = -maxRoadX;
      this.playerSpeedMs *= 0.92; // scrape penalty
      this.camShakeIntensity = 0.4;
      sound.playScreech();
      this.emitSparks(new THREE.Vector3(this.playerX, 0.4, this.playerZ), 6, new THREE.Vector3(1, 1, -1));
    } else if (this.playerX > maxRoadX) {
      this.playerX = maxRoadX;
      this.playerSpeedMs *= 0.92;
      this.camShakeIntensity = 0.4;
      sound.playScreech();
      this.emitSparks(new THREE.Vector3(this.playerX, 0.4, this.playerZ), 6, new THREE.Vector3(-1, 1, -1));
    }

    // Forward translation
    const forwardStep = this.playerSpeedMs * delta;
    this.playerZ += forwardStep;
    this.distanceTraveled += forwardStep;

    // Update chassis tilt & body rotations
    const targetRoll = -steerDir * 0.07 * speedRatio; // lean into turns
    const targetYaw = -this.playerSteerAngle * 0.28;
    this.playerRoll = THREE.MathUtils.lerp(this.playerRoll, targetRoll, delta * 8.0);
    this.playerYaw = THREE.MathUtils.lerp(this.playerYaw, targetYaw, delta * 8.0);

    if (this.playerCarBundle) {
      this.playerCarBundle.group.position.set(this.playerX, this.playerY, this.playerZ);
      this.playerCarBundle.group.rotation.set(0, this.playerYaw, this.playerRoll);

      // Turn front wheels
      const wheelTurn = this.playerSteerAngle;
      this.playerCarBundle.frontLeftWheel.rotation.y = wheelTurn;
      this.playerCarBundle.frontRightWheel.rotation.y = Math.PI + wheelTurn;

      // Roll all wheels forward
      const wheelRoll = (forwardStep * Math.PI * 2) / 2.1;
      this.playerCarBundle.frontLeftWheel.rotation.x += wheelRoll;
      this.playerCarBundle.frontRightWheel.rotation.x -= wheelRoll;
      this.playerCarBundle.rearLeftWheel.rotation.x += wheelRoll;
      this.playerCarBundle.rearRightWheel.rotation.x -= wheelRoll;

      // Brake lights activation
      setBrakeLights(this.playerCarBundle.brakeLights, this.input.brake);

      // Nitro exhaust flames
      if (this.exhaustFlameLeft && this.exhaustFlameRight && this.playerCarBundle.exhaustPositions.length >= 2) {
        this.exhaustFlameLeft.visible = this.isNitroActive;
        this.exhaustFlameRight.visible = this.isNitroActive;

        if (this.isNitroActive) {
          const ep0 = this.playerCarBundle.exhaustPositions[0];
          const ep1 = this.playerCarBundle.exhaustPositions[1];
          const flicker = 0.85 + Math.random() * 0.3;

          this.exhaustFlameLeft.position.set(this.playerX + ep0.x, 0.26, this.playerZ + ep0.z);
          this.exhaustFlameRight.position.set(this.playerX + ep1.x, 0.26, this.playerZ + ep1.z);
          this.exhaustFlameLeft.scale.set(flicker, flicker, flicker * 1.3);
          this.exhaustFlameRight.scale.set(flicker, flicker, flicker * 1.3);
        }
      }
    }

    // Score accumulation
    const speedKmh = this.playerSpeedMs * 3.6;
    if (speedKmh > this.maxSpeedAchievedKmh) {
      this.maxSpeedAchievedKmh = Math.round(speedKmh);
    }

    // Speed multiplier: 1.0x at 80km/h up to 3.2x at 240+ km/h
    const multiplier = Math.max(1.0, Number((speedKmh / 80).toFixed(1)));
    const scoreRate = speedKmh > 50 ? (speedKmh * 0.5) * multiplier : 10;
    this.currentScore += scoreRate * delta;
  }

  private updateCollisionsAndPrizes(delta: number) {
    if (!this.playerCarBundle) return;

    const speedKmh = this.playerSpeedMs * 3.6;

    // 1. Near Miss Check
    const nearMissResult = this.trafficManager.checkNearMiss(
      this.playerX,
      this.playerZ,
      this.playerCarBundle.length,
      this.playerCarBundle.width,
      speedKmh
    );

    if (nearMissResult) {
      this.nearMissesCount++;
      this.currentScore += nearMissResult.bonusScore;
      this.coinsEarnedThisRun += nearMissResult.bonusCoins;
      this.nitroCharge = Math.min(100, this.nitroCharge + 15); // near misses grant nitro!
      sound.playNearMiss();

      this.callbacks.onNearMiss({
        id: Date.now(),
        text: `NEAR MISS! +${nearMissResult.bonusScore} PTS`,
        score: nearMissResult.bonusScore,
        coins: nearMissResult.bonusCoins,
        timestamp: Date.now(),
      });
    }

    // 2. Coin Pickup Check
    const coins = this.environment.coins;
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (!c.collected) {
        const dx = Math.abs(this.playerX - c.position.x);
        const dz = Math.abs(this.playerZ - c.position.z);

        if (dx < 1.4 && dz < 2.2) {
          c.collected = true;
          c.mesh.visible = false;
          this.coinsEarnedThisRun += 10;
          this.currentScore += 250;
          sound.playCoin();
          this.callbacks.onCoinCollected(this.coinsEarnedThisRun, 10);
          this.emitSparks(new THREE.Vector3(c.position.x, 0.9, c.position.z), 5, new THREE.Vector3(0, 2, 0));
        }
      }
    }

    // 3. Traffic Vehicle Collisions
    const collision = this.trafficManager.checkCollisions(
      this.playerX,
      this.playerZ,
      this.playerCarBundle.length,
      this.playerCarBundle.width
    );

    if (collision.hasCollided && collision.trafficCar) {
      const traffic = collision.trafficCar;
      const relativeSpeedKmh = Math.abs(this.playerSpeedMs - traffic.speedMs) * 3.6;

      // Minor sideswipe or major high-speed collision
      if (relativeSpeedKmh < 32 && collision.overlapZ < 1.2) {
        // Minor side bump / scrape
        this.playerSpeedMs *= 0.78;
        this.playerX += (this.playerX > traffic.x ? 1 : -1) * 0.6;
        this.camShakeIntensity = 0.6;
        sound.playScreech();
        this.emitSparks(
          new THREE.Vector3(this.playerX, 0.5, this.playerZ),
          12,
          new THREE.Vector3(this.playerX - traffic.x, 1, -1)
        );
      } else {
        // Major high-speed crash! Game Over!
        this.triggerCrash(traffic);
      }
    }
  }

  private triggerCrash(traffic: { x: number; z: number; speedMs: number }) {
    this.isCrashing = true;
    this.crashTimer = 0;
    this.camShakeIntensity = 1.2;

    sound.playCrash();
    sound.stopEngine();

    // Launch into dynamic crash trajectory
    const impactDirX = this.playerX > traffic.x ? 4.5 : -4.5;
    this.crashLinearVel.set(impactDirX, 5.5, this.playerSpeedMs * 0.4);
    this.crashAngularVel.set(
      (Math.random() - 0.5) * 8.0,
      (Math.random() - 0.5) * 8.0,
      (Math.random() - 0.5) * 8.0
    );

    this.emitSparks(new THREE.Vector3(this.playerX, 0.7, this.playerZ), 40, new THREE.Vector3(impactDirX, 3, -1));
  }

  private updateCrashPhysics(delta: number) {
    if (!this.playerCarBundle) return;

    this.crashTimer += delta;

    // Tumble physics
    this.playerX += this.crashLinearVel.x * delta;
    this.playerY += this.crashLinearVel.y * delta;
    this.playerZ += this.crashLinearVel.z * delta;

    this.crashLinearVel.y -= 14.0 * delta; // Gravity
    this.crashLinearVel.x *= 0.96;
    this.crashLinearVel.z *= 0.94;

    // Ground collision
    if (this.playerY <= 0) {
      this.playerY = 0;
      this.crashLinearVel.y = -this.crashLinearVel.y * 0.35; // bounce
      this.emitSparks(new THREE.Vector3(this.playerX, 0.2, this.playerZ), 8);
    }

    this.playerCarBundle.group.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerCarBundle.group.rotation.x += this.crashAngularVel.x * delta;
    this.playerCarBundle.group.rotation.y += this.crashAngularVel.y * delta;
    this.playerCarBundle.group.rotation.z += this.crashAngularVel.z * delta;

    // After ~1.4 seconds of dramatic slow-mo crash, trigger Game Over modal
    if (this.crashTimer >= 1.4) {
      this.isRunning = false;
      this.callbacks.onGameOver({
        finalScore: Math.round(this.currentScore),
        distanceMeters: Math.round(this.distanceTraveled),
        maxSpeedKmh: this.maxSpeedAchievedKmh,
        nearMisses: this.nearMissesCount,
        coinsEarned: this.coinsEarnedThisRun,
      });
    }
  }

  private updateCamera(delta: number) {
    const speedRatio = Math.min(1.0, this.playerSpeedMs / 70);

    // Dynamic FOV based on speed (widens as you go fast for hyperspeed feel)
    const targetFov = 60 + speedRatio * 13;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 3.5);
    this.camera.updateProjectionMatrix();

    // Camera follow offsets behind player
    const camDist = 6.2 + speedRatio * 1.2;
    const camHeight = 2.8 + speedRatio * 0.3;
    const camLateralSway = this.playerSteerAngle * 1.5;

    const targetCamX = this.playerX * 0.75 + camLateralSway;
    const targetCamY = this.playerY + camHeight;
    const targetCamZ = this.playerZ - camDist;

    // Camera shake calculation (from speed + crash)
    let shakeX = 0;
    let shakeY = 0;
    if (this.camShakeIntensity > 0.01) {
      shakeX = (Math.random() - 0.5) * this.camShakeIntensity;
      shakeY = (Math.random() - 0.5) * this.camShakeIntensity;
      this.camShakeIntensity = THREE.MathUtils.lerp(this.camShakeIntensity, 0, delta * 4.0);
    } else if (speedRatio > 0.8) {
      // Subtle speed vibration at 200+ km/h
      const vib = (speedRatio - 0.8) * 0.08;
      shakeX = (Math.random() - 0.5) * vib;
      shakeY = (Math.random() - 0.5) * vib;
    }

    this.currentCamPos.x = THREE.MathUtils.lerp(this.currentCamPos.x, targetCamX + shakeX, delta * 9.0);
    this.currentCamPos.y = THREE.MathUtils.lerp(this.currentCamPos.y, targetCamY + shakeY, delta * 9.0);
    this.currentCamPos.z = THREE.MathUtils.lerp(this.currentCamPos.z, targetCamZ, delta * 12.0);

    this.camera.position.copy(this.currentCamPos);

    // Look Target
    const lookAheadDist = 18 + speedRatio * 16;
    const targetLookX = this.playerX * 0.85;
    const targetLookY = this.playerY + 1.2;
    const targetLookZ = this.playerZ + lookAheadDist;

    this.currentLookTarget.x = THREE.MathUtils.lerp(this.currentLookTarget.x, targetLookX, delta * 10.0);
    this.currentLookTarget.y = THREE.MathUtils.lerp(this.currentLookTarget.y, targetLookY, delta * 10.0);
    this.currentLookTarget.z = THREE.MathUtils.lerp(this.currentLookTarget.z, targetLookZ, delta * 14.0);

    this.camera.lookAt(this.currentLookTarget);
  }

  private updateAudioAndTelemetry() {
    const speedKmh = Math.round(this.playerSpeedMs * 3.6);

    // Gear & RPM calculations
    let gear = 1;
    let rpmNorm = 0.2;
    if (speedKmh < 45) {
      gear = 1;
      rpmNorm = speedKmh / 45;
    } else if (speedKmh < 85) {
      gear = 2;
      rpmNorm = (speedKmh - 45) / 40;
    } else if (speedKmh < 135) {
      gear = 3;
      rpmNorm = (speedKmh - 85) / 50;
    } else if (speedKmh < 190) {
      gear = 4;
      rpmNorm = (speedKmh - 135) / 55;
    } else if (speedKmh < 240) {
      gear = 5;
      rpmNorm = (speedKmh - 190) / 50;
    } else {
      gear = 6;
      rpmNorm = Math.min(1.0, (speedKmh - 240) / 60);
    }

    const rpm = Math.round(1000 + rpmNorm * 7000);
    sound.updateEngine(speedKmh, rpmNorm, this.input.throttle);

    const multiplier = Math.max(1.0, Number((speedKmh / 80).toFixed(1)));

    this.callbacks.onTelemetry({
      speedKmh,
      maxSpeedKmh: this.maxSpeedAchievedKmh,
      rpm,
      gear,
      distanceMeters: Math.round(this.distanceTraveled),
      score: Math.round(this.currentScore),
      multiplier,
      coinsEarned: this.coinsEarnedThisRun,
      nearMisses: this.nearMissesCount,
      nitroPercent: Math.round(this.nitroCharge),
      isNitroActive: this.isNitroActive,
      isBraking: this.input.brake,
      isHornActive: this.input.horn,
    });
  }

  public renderTurntable(carDef: CarDefinition, paintHex: string, upgrades: Upgrades, rotAngle: number) {
    // Used in Garage mode to display a rotating 3D showcase
    this.activeCarDef = carDef;
    this.activeUpgrades = upgrades;
    this.effectiveStats = computeEffectiveStats(carDef, upgrades);

    if (this.playerCarBundle) {
      this.scene.remove(this.playerCarBundle.group);
    }
    this.playerCarBundle = buildPlayerCar(carDef, paintHex);
    this.scene.add(this.playerCarBundle.group);

    this.playerCarBundle.group.position.set(0, 0, 0);
    this.playerCarBundle.group.rotation.set(0, rotAngle, 0);

    // Orbit camera around car
    const radius = 6.2;
    const camX = Math.sin(rotAngle * 0.5 + 0.8) * radius;
    const camZ = -Math.cos(rotAngle * 0.5 + 0.8) * radius;
    this.camera.position.set(camX, 2.2, camZ);
    this.camera.lookAt(0, 0.7, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private setupResize() {
    const onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopEngine();
    sound.stopHorn();
    this.renderer.dispose();
  }
}
