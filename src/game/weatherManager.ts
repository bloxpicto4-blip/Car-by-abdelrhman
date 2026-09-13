import * as THREE from 'three';
import { WeatherCondition } from '../types';
import { HighwayEnvironment } from './environment';
import { sound } from '../utils/audio';

interface WeatherPreset {
  fogDensity: number;
  fogColor: THREE.Color;
  ambientIntensity: number;
  dirLightIntensity: number;
  dirLightColor: THREE.Color;
  skyIntensity: number;
  skyColor: THREE.Color;
  roadWetness: number;
  rainIntensity: number;
}

const WEATHER_PRESETS: Record<WeatherCondition, WeatherPreset> = {
  clear: {
    fogDensity: 0.0068,
    fogColor: new THREE.Color(0x0a0f1d), // Deep twilight navy
    ambientIntensity: 1.35,
    dirLightIntensity: 1.85,
    dirLightColor: new THREE.Color(0xe2e8f0),
    skyIntensity: 0.95,
    skyColor: new THREE.Color(0x38bdf8),
    roadWetness: 0.0,
    rainIntensity: 0.0,
  },
  rainy: {
    fogDensity: 0.0135,
    fogColor: new THREE.Color(0x111827), // Moody storm gray
    ambientIntensity: 0.95,
    dirLightIntensity: 1.1,
    dirLightColor: new THREE.Color(0x94a3b8),
    skyIntensity: 0.55,
    skyColor: new THREE.Color(0x64748b),
    roadWetness: 1.0,
    rainIntensity: 1.0,
  },
  foggy: {
    fogDensity: 0.0265, // Thick enveloping mist
    fogColor: new THREE.Color(0x283548), // Cool hazy fog
    ambientIntensity: 1.45,
    dirLightIntensity: 0.65,
    dirLightColor: new THREE.Color(0xcbd5e1),
    skyIntensity: 0.85,
    skyColor: new THREE.Color(0x94a3b8),
    roadWetness: 0.35,
    rainIntensity: 0.08, // Faint mist drizzle
  },
};

export class WeatherManager {
  private scene: THREE.Scene;
  private environment: HighwayEnvironment;
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private skyLight: THREE.HemisphereLight;

  // Weather state
  public currentCondition: WeatherCondition = 'clear';
  private targetCondition: WeatherCondition = 'clear';
  private transitionProgress: number = 1.0;
  private transitionDuration: number = 3.5; // seconds to smoothly interpolate
  private cycleTimer: number = 0;
  private cycleDuration: number = 28; // randomly 24-38 seconds per state

  // Interpolated values
  private currentFogDensity: number = WEATHER_PRESETS.clear.fogDensity;
  private currentFogColor: THREE.Color = WEATHER_PRESETS.clear.fogColor.clone();
  private currentAmbientIntensity: number = WEATHER_PRESETS.clear.ambientIntensity;
  private currentDirIntensity: number = WEATHER_PRESETS.clear.dirLightIntensity;
  private currentDirColor: THREE.Color = WEATHER_PRESETS.clear.dirLightColor.clone();
  private currentSkyIntensity: number = WEATHER_PRESETS.clear.skyIntensity;
  private currentSkyColor: THREE.Color = WEATHER_PRESETS.clear.skyColor.clone();
  private currentWetness: number = WEATHER_PRESETS.clear.roadWetness;
  private currentRainIntensity: number = WEATHER_PRESETS.clear.rainIntensity;

  // Rain particle system
  private rainParticleCount: number = 1800;
  private rainParticles: THREE.Points | null = null;
  private rainPositions!: Float32Array;
  private rainVelocities!: Float32Array;
  private rainMaterial!: THREE.PointsMaterial;

  // Ground splash particles
  private splashCount: number = 90;
  private splashParticles: THREE.Points | null = null;
  private splashPositions!: Float32Array;
  private splashLifetimes!: Float32Array;

  constructor(
    scene: THREE.Scene,
    environment: HighwayEnvironment,
    ambientLight: THREE.AmbientLight,
    dirLight: THREE.DirectionalLight,
    skyLight: THREE.HemisphereLight
  ) {
    this.scene = scene;
    this.environment = environment;
    this.ambientLight = ambientLight;
    this.dirLight = dirLight;
    this.skyLight = skyLight;

    this.initRainParticles();
    this.initSplashParticles();
    this.resetTimer();
  }

  private resetTimer() {
    // Random cycle duration between 24 and 38 seconds
    this.cycleDuration = 24 + Math.random() * 14;
    this.cycleTimer = 0;
  }

  private initRainParticles() {
    const geo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(this.rainParticleCount * 3);
    this.rainVelocities = new Float32Array(this.rainParticleCount);

    const boxWidth = 50;
    const boxHeight = 24;
    const boxDepth = 65;

    for (let i = 0; i < this.rainParticleCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * boxWidth;
      this.rainPositions[i * 3 + 1] = Math.random() * boxHeight;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.3) * boxDepth;
      this.rainVelocities[i] = 32 + Math.random() * 12; // 32 - 44 m/s fall speed
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    this.rainMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd, // translucent sky blue
      size: 0.28,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.rainParticles = new THREE.Points(geo, this.rainMaterial);
    this.scene.add(this.rainParticles);
  }

  private initSplashParticles() {
    const geo = new THREE.BufferGeometry();
    this.splashPositions = new Float32Array(this.splashCount * 3);
    this.splashLifetimes = new Float32Array(this.splashCount);

    for (let i = 0; i < this.splashCount; i++) {
      this.splashPositions[i * 3] = 0;
      this.splashPositions[i * 3 + 1] = -100; // hidden initially
      this.splashPositions[i * 3 + 2] = 0;
      this.splashLifetimes[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.splashPositions, 3));

    const splashMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.2,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.splashParticles = new THREE.Points(geo, splashMat);
    this.scene.add(this.splashParticles);
  }

  public setWeather(condition: WeatherCondition, immediate: boolean = false) {
    if (this.targetCondition === condition && !immediate) return;

    this.targetCondition = condition;
    if (immediate) {
      this.currentCondition = condition;
      this.transitionProgress = 1.0;
      this.applyPresetValues(WEATHER_PRESETS[condition]);
    } else {
      this.transitionProgress = 0.0;
    }
  }

  private applyPresetValues(preset: WeatherPreset) {
    this.currentFogDensity = preset.fogDensity;
    this.currentFogColor.copy(preset.fogColor);
    this.currentAmbientIntensity = preset.ambientIntensity;
    this.currentDirIntensity = preset.dirLightIntensity;
    this.currentDirColor.copy(preset.dirLightColor);
    this.currentSkyIntensity = preset.skyIntensity;
    this.currentSkyColor.copy(preset.skyColor);
    this.currentWetness = preset.roadWetness;
    this.currentRainIntensity = preset.rainIntensity;

    this.applyToThree();
  }

  private applyToThree() {
    // 1. Fog
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = this.currentFogDensity;
      this.scene.fog.color.copy(this.currentFogColor);
    }
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(this.currentFogColor);
    }

    // 2. Lights
    this.ambientLight.intensity = this.currentAmbientIntensity;
    this.dirLight.intensity = this.currentDirIntensity;
    this.dirLight.color.copy(this.currentDirColor);
    this.skyLight.intensity = this.currentSkyIntensity;
    this.skyLight.color.copy(this.currentSkyColor);

    // 3. Environment Wetness
    this.environment.setRoadWetness(this.currentWetness);

    // 4. Rain Particles Opacity
    if (this.rainMaterial) {
      this.rainMaterial.opacity = this.currentRainIntensity * 0.72;
    }

    // 5. Audio
    sound.setRainIntensity(this.currentRainIntensity);
  }

  public update(playerX: number, playerZ: number, playerSpeedMs: number, delta: number) {
    // 1. Cycle logic
    this.cycleTimer += delta;
    if (this.cycleTimer >= this.cycleDuration) {
      this.cycleToNextRandomCondition();
      this.resetTimer();
    }

    // 2. Smooth transition interpolation
    if (this.transitionProgress < 1.0) {
      this.transitionProgress += delta / this.transitionDuration;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.currentCondition = this.targetCondition;
      }

      const fromPreset = WEATHER_PRESETS[this.currentCondition];
      const toPreset = WEATHER_PRESETS[this.targetCondition];
      const t = this.transitionProgress;
      // Smooth step ease
      const ease = t * t * (3 - 2 * t);

      this.currentFogDensity = THREE.MathUtils.lerp(fromPreset.fogDensity, toPreset.fogDensity, ease);
      this.currentFogColor.lerpColors(fromPreset.fogColor, toPreset.fogColor, ease);
      this.currentAmbientIntensity = THREE.MathUtils.lerp(fromPreset.ambientIntensity, toPreset.ambientIntensity, ease);
      this.currentDirIntensity = THREE.MathUtils.lerp(fromPreset.dirLightIntensity, toPreset.dirLightIntensity, ease);
      this.currentDirColor.lerpColors(fromPreset.dirLightColor, toPreset.dirLightColor, ease);
      this.currentSkyIntensity = THREE.MathUtils.lerp(fromPreset.skyIntensity, toPreset.skyIntensity, ease);
      this.currentSkyColor.lerpColors(fromPreset.skyColor, toPreset.skyColor, ease);
      this.currentWetness = THREE.MathUtils.lerp(fromPreset.roadWetness, toPreset.roadWetness, ease);
      this.currentRainIntensity = THREE.MathUtils.lerp(fromPreset.rainIntensity, toPreset.rainIntensity, ease);

      this.applyToThree();
    }

    // 3. Rain Particles update
    if (this.rainParticles && this.currentRainIntensity > 0.01) {
      this.updateRainSimulation(playerX, playerZ, playerSpeedMs, delta);
    }
  }

  private cycleToNextRandomCondition() {
    const conditions: WeatherCondition[] = ['clear', 'rainy', 'foggy'];
    // Filter out current condition so it always changes to a new atmosphere
    const nextCandidates = conditions.filter((c) => c !== this.currentCondition);
    const next = nextCandidates[Math.floor(Math.random() * nextCandidates.length)];
    this.setWeather(next, false);
  }

  private updateRainSimulation(playerX: number, playerZ: number, playerSpeedMs: number, delta: number) {
    const boxHalfWidth = 24;
    const boxHeight = 24;
    const boxAhead = 45;
    const boxBehind = 15;

    const posAttr = this.rainParticles!.geometry.attributes.position as THREE.BufferAttribute;
    const speedDrag = (playerSpeedMs + 12) * delta;

    let splashIdx = 0;

    for (let i = 0; i < this.rainParticleCount; i++) {
      const idx = i * 3;

      // Fall down
      this.rainPositions[idx + 1] -= this.rainVelocities[i] * delta;

      // Slant backwards relative to highway car velocity
      this.rainPositions[idx + 2] -= speedDrag * 0.45;

      // Check ground collision
      if (this.rainPositions[idx + 1] <= 0.05) {
        // Trigger splash near player
        if (splashIdx < this.splashCount && Math.random() < 0.25) {
          const sIdx = splashIdx * 3;
          this.splashPositions[sIdx] = this.rainPositions[idx];
          this.splashPositions[sIdx + 1] = 0.08;
          this.splashPositions[sIdx + 2] = this.rainPositions[idx + 2];
          this.splashLifetimes[splashIdx] = 0.12;
          splashIdx++;
        }

        // Reset particle to top
        this.rainPositions[idx + 1] = boxHeight;
        this.rainPositions[idx] = playerX + (Math.random() - 0.5) * (boxHalfWidth * 2);
        this.rainPositions[idx + 2] = playerZ + (Math.random() * (boxAhead + boxBehind) - boxBehind);
      }

      // Keep particles localized to player bubble
      const dx = this.rainPositions[idx] - playerX;
      if (Math.abs(dx) > boxHalfWidth) {
        this.rainPositions[idx] = playerX + (Math.random() - 0.5) * (boxHalfWidth * 2);
      }

      const dz = this.rainPositions[idx + 2] - playerZ;
      if (dz < -boxBehind || dz > boxAhead) {
        this.rainPositions[idx + 2] = playerZ + (Math.random() * (boxAhead + boxBehind) - boxBehind);
      }
    }

    posAttr.needsUpdate = true;

    // Update splash lifetimes
    if (this.splashParticles) {
      let anySplash = false;
      for (let s = 0; s < this.splashCount; s++) {
        if (this.splashLifetimes[s] > 0) {
          anySplash = true;
          this.splashLifetimes[s] -= delta;
          if (this.splashLifetimes[s] <= 0) {
            this.splashPositions[s * 3 + 1] = -100;
          }
        }
      }
      if (anySplash) {
        this.splashParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  public reset(condition: WeatherCondition = 'clear') {
    this.setWeather(condition, true);
    this.resetTimer();
  }
}
