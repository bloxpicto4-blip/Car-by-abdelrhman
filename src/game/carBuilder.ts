import * as THREE from 'three';
import { CarDefinition } from '../types';

export interface CarMeshBundle {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  brakeLights: THREE.Mesh[];
  headlights: THREE.Mesh[];
  exhaustPositions: THREE.Vector3[];
  length: number;
  width: number;
  height: number;
}

// Reusable geometries and materials to avoid redundant GPU allocations
const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 16);
tireGeo.rotateZ(Math.PI / 2);

const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.27, 12);
rimGeo.rotateZ(Math.PI / 2);

const tireMat = new THREE.MeshStandardMaterial({
  color: 0x181818,
  roughness: 0.85,
  metalness: 0.1,
});

const rimMat = new THREE.MeshStandardMaterial({
  color: 0xd4d4d8,
  roughness: 0.3,
  metalness: 0.85,
});

const glassMat = new THREE.MeshStandardMaterial({
  color: 0x09090b,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.85,
});

const headlightMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 0.9,
  roughness: 0.2,
});

const tailNormalMat = new THREE.MeshStandardMaterial({
  color: 0x991b1b,
  emissive: 0xef4444,
  emissiveIntensity: 0.4,
  roughness: 0.3,
});

const tailBrakeMat = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 2.2,
  roughness: 0.1,
});

const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xe4e4e7,
  metalness: 0.95,
  roughness: 0.15,
});

const blackTrimMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  metalness: 0.4,
  roughness: 0.7,
});

function createWheel(): THREE.Group {
  const wheel = new THREE.Group();
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.castShadow = true;
  tire.receiveShadow = true;
  wheel.add(tire);

  const rim = new THREE.Mesh(rimGeo, rimMat);
  wheel.add(rim);

  // Center hubcap / spoke detail
  const hubGeo = new THREE.BoxGeometry(0.06, 0.38, 0.08);
  const spoke = new THREE.Mesh(hubGeo, rimMat);
  wheel.add(spoke);

  return wheel;
}

export function buildPlayerCar(carDef: CarDefinition, paintHex?: string): CarMeshBundle {
  const group = new THREE.Group();
  group.name = `PlayerCar_${carDef.id}`;

  const paintColor = new THREE.Color(paintHex || carDef.defaultColor);
  const bodyPaintMat = new THREE.MeshStandardMaterial({
    color: paintColor,
    roughness: 0.28,
    metalness: 0.78,
  });

  const brakeLights: THREE.Mesh[] = [];
  const headlights: THREE.Mesh[] = [];
  const exhaustPositions: THREE.Vector3[] = [];

  // Main chassis measurements (standard sports car ~ 4.4m length, 1.9m width, 1.25m height)
  let length = 4.4;
  let width = 1.9;
  let height = 1.22;

  // 1. Lower chassis / body
  const lowerBodyGeo = new THREE.BoxGeometry(width, 0.46, length);
  const bodyMesh = new THREE.Mesh(lowerBodyGeo, bodyPaintMat);
  bodyMesh.position.y = 0.45;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Cabin / Greenhouse
  const cabinWidth = width * 0.76;
  const cabinLength = length * 0.48;
  const cabinHeight = 0.52;
  const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
  const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
  cabinMesh.position.set(0, 0.88, -0.15);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // 3. Roof panel
  const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.95, 0.05, cabinLength * 0.85);
  const roofMesh = new THREE.Mesh(roofGeo, bodyPaintMat);
  roofMesh.position.set(0, 1.13, -0.18);
  group.add(roofMesh);

  // 4. Front Hood slope
  const hoodGeo = new THREE.BoxGeometry(width * 0.88, 0.26, length * 0.32);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyPaintMat);
  hoodMesh.position.set(0, 0.55, 1.25);
  hoodMesh.rotation.x = 0.06;
  group.add(hoodMesh);

  // 5. Front Splitter / Grille
  const grilleGeo = new THREE.BoxGeometry(width * 0.82, 0.2, 0.15);
  const grilleMesh = new THREE.Mesh(grilleGeo, blackTrimMat);
  grilleMesh.position.set(0, 0.32, length * 0.5);
  group.add(grilleMesh);

  // 6. Rear Diffuser
  const diffuserGeo = new THREE.BoxGeometry(width * 0.88, 0.22, 0.2);
  const diffuserMesh = new THREE.Mesh(diffuserGeo, blackTrimMat);
  diffuserMesh.position.set(0, 0.32, -length * 0.5);
  group.add(diffuserMesh);

  // Model-specific aesthetics
  if (carDef.category === 'muscle') {
    // Muscle hood scoop
    const scoopGeo = new THREE.BoxGeometry(0.5, 0.14, 0.7);
    const scoop = new THREE.Mesh(scoopGeo, blackTrimMat);
    scoop.position.set(0, 0.72, 1.1);
    group.add(scoop);

    // Dual black racing stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const stripe1 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, length * 0.8), stripeMat);
    stripe1.rotation.x = -Math.PI / 2;
    stripe1.position.set(-0.25, 0.7, 0.3);
    group.add(stripe1);
    const stripe2 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, length * 0.8), stripeMat);
    stripe2.rotation.x = -Math.PI / 2;
    stripe2.position.set(0.25, 0.7, 0.3);
    group.add(stripe2);
  } else if (carDef.category === 'super' || carDef.category === 'hyper') {
    // Elevated GT Wing / Spoiler
    const wingWidth = width * 0.95;
    const wingGeo = new THREE.BoxGeometry(wingWidth, 0.06, 0.35);
    const wing = new THREE.Mesh(wingGeo, blackTrimMat);
    wing.position.set(0, 1.05, -length * 0.45);
    group.add(wing);

    // Wing uprights
    const postGeo = new THREE.BoxGeometry(0.05, 0.35, 0.15);
    const leftPost = new THREE.Mesh(postGeo, blackTrimMat);
    leftPost.position.set(-wingWidth * 0.35, 0.85, -length * 0.45);
    group.add(leftPost);
    const rightPost = new THREE.Mesh(postGeo, blackTrimMat);
    rightPost.position.set(wingWidth * 0.35, 0.85, -length * 0.45);
    group.add(rightPost);

    if (carDef.category === 'hyper') {
      // Shark dorsal fin
      const finGeo = new THREE.BoxGeometry(0.04, 0.32, 1.2);
      const fin = new THREE.Mesh(finGeo, blackTrimMat);
      fin.position.set(0, 1.1, -0.6);
      group.add(fin);
    }
  }

  // 7. Headlights
  const hlGeo = new THREE.BoxGeometry(0.36, 0.14, 0.1);
  const leftHl = new THREE.Mesh(hlGeo, headlightMat);
  leftHl.position.set(-width * 0.36, 0.52, length * 0.5);
  group.add(leftHl);
  headlights.push(leftHl);

  const rightHl = new THREE.Mesh(hlGeo, headlightMat);
  rightHl.position.set(width * 0.36, 0.52, length * 0.5);
  group.add(rightHl);
  headlights.push(rightHl);

  // 8. Tail Lights (Dual LED horizontal bars)
  const tlGeo = new THREE.BoxGeometry(0.42, 0.12, 0.08);
  const leftTl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
  leftTl.position.set(-width * 0.35, 0.55, -length * 0.5);
  group.add(leftTl);
  brakeLights.push(leftTl);

  const rightTl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
  rightTl.position.set(width * 0.35, 0.55, -length * 0.5);
  group.add(rightTl);
  brakeLights.push(rightTl);

  // 9. Side Mirrors
  const mirrorGeo = new THREE.BoxGeometry(0.18, 0.1, 0.14);
  const leftMirror = new THREE.Mesh(mirrorGeo, blackTrimMat);
  leftMirror.position.set(-width * 0.52, 0.78, 0.4);
  group.add(leftMirror);

  const rightMirror = new THREE.Mesh(mirrorGeo, blackTrimMat);
  rightMirror.position.set(width * 0.52, 0.78, 0.4);
  group.add(rightMirror);

  // 10. Exhaust pipes
  const exhaustGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.2, 10);
  exhaustGeo.rotateX(Math.PI / 2);
  const leftExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
  leftExhaust.position.set(-0.4, 0.26, -length * 0.5 - 0.05);
  group.add(leftExhaust);
  exhaustPositions.push(new THREE.Vector3(-0.4, 0.26, -length * 0.5 - 0.15));

  const rightExhaust = new THREE.Mesh(exhaustGeo, chromeMat);
  rightExhaust.position.set(0.4, 0.26, -length * 0.5 - 0.05);
  group.add(rightExhaust);
  exhaustPositions.push(new THREE.Vector3(0.4, 0.26, -length * 0.5 - 0.15));

  // 11. 4 Wheels with individual steering groups for front
  const wheelX = width * 0.5;
  const wheelY = 0.34;
  const frontZ = length * 0.32;
  const rearZ = -length * 0.31;

  const frontLeftWheel = createWheel();
  frontLeftWheel.position.set(-wheelX, wheelY, frontZ);
  group.add(frontLeftWheel);

  const frontRightWheel = createWheel();
  frontRightWheel.position.set(wheelX, wheelY, frontZ);
  frontRightWheel.rotation.y = Math.PI;
  group.add(frontRightWheel);

  const rearLeftWheel = createWheel();
  rearLeftWheel.position.set(-wheelX, wheelY, rearZ);
  group.add(rearLeftWheel);

  const rearRightWheel = createWheel();
  rearRightWheel.position.set(wheelX, wheelY, rearZ);
  rearRightWheel.rotation.y = Math.PI;
  group.add(rearRightWheel);

  return {
    group,
    bodyMesh,
    frontLeftWheel,
    frontRightWheel,
    rearLeftWheel,
    rearRightWheel,
    brakeLights,
    headlights,
    exhaustPositions,
    length,
    width,
    height,
  };
}

// -------------------------------------------------------------
// AI TRAFFIC VEHICLES
// -------------------------------------------------------------
export type TrafficType = 'sedan' | 'suv' | 'truck' | 'sport';

const TRAFFIC_PALETTES = [
  0xf43f5e, // Rose
  0x3b82f6, // Blue
  0xe2e8f0, // White pearl
  0x64748b, // Slate gray
  0x1e293b, // Deep charcoal
  0xeab308, // Taxi Yellow
  0x10b981, // Emerald
];

export interface TrafficMeshBundle {
  group: THREE.Group;
  type: TrafficType;
  length: number;
  width: number;
  height: number;
  brakeLights: THREE.Mesh[];
  wheels: THREE.Group[];
}

export function buildTrafficVehicle(type: TrafficType, colorHex?: number): TrafficMeshBundle {
  const group = new THREE.Group();
  const color = colorHex || TRAFFIC_PALETTES[Math.floor(Math.random() * TRAFFIC_PALETTES.length)];
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.65,
  });

  const brakeLights: THREE.Mesh[] = [];
  const wheels: THREE.Group[] = [];

  let length = 4.4;
  let width = 1.9;
  let height = 1.35;

  if (type === 'truck') {
    // Semi-trailer truck (Cab + Long 18-wheel cargo trailer)
    length = 11.0;
    width = 2.4;
    height = 3.6;

    // 1. Cab
    const cabMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 });
    const cabGeo = new THREE.BoxGeometry(2.3, 2.6, 2.8);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.8, 3.8);
    cab.castShadow = true;
    group.add(cab);

    // Cab windshield
    const windGeo = new THREE.BoxGeometry(2.1, 1.0, 0.2);
    const wind = new THREE.Mesh(windGeo, glassMat);
    wind.position.set(0, 2.3, 5.25);
    group.add(wind);

    // Chrome front grill
    const grillGeo = new THREE.BoxGeometry(1.8, 1.1, 0.15);
    const grill = new THREE.Mesh(grillGeo, chromeMat);
    grill.position.set(0, 1.2, 5.25);
    group.add(grill);

    // Chrome vertical exhaust stacks
    const stackGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8);
    const leftStack = new THREE.Mesh(stackGeo, chromeMat);
    leftStack.position.set(-1.1, 2.8, 2.4);
    group.add(leftStack);
    const rightStack = new THREE.Mesh(stackGeo, chromeMat);
    rightStack.position.set(1.1, 2.8, 2.4);
    group.add(rightStack);

    // 2. Cargo Trailer
    const trailerMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.25,
    });
    const trailerGeo = new THREE.BoxGeometry(2.4, 2.7, 7.8);
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(0, 2.2, -1.6);
    trailer.castShadow = true;
    group.add(trailer);

    // Trailer stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.2, 7.7), stripeMat);
    stripe.position.set(0, 1.3, -1.6);
    group.add(stripe);

    // Rear trailer brake lights
    const tlGeo = new THREE.BoxGeometry(0.5, 0.18, 0.1);
    const ltl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    ltl.position.set(-0.85, 1.0, -5.55);
    group.add(ltl);
    brakeLights.push(ltl);

    const rtl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    rtl.position.set(0.85, 1.0, -5.55);
    group.add(rtl);
    brakeLights.push(rtl);

    // Wheels: 6 axle pairs for realistic 18-wheeler look
    const wheelPositions = [
      { x: 1.15, y: 0.5, z: 4.4 },
      { x: -1.15, y: 0.5, z: 4.4 },
      { x: 1.15, y: 0.5, z: 2.7 },
      { x: -1.15, y: 0.5, z: 2.7 },
      { x: 1.15, y: 0.5, z: -4.2 },
      { x: -1.15, y: 0.5, z: -4.2 },
      { x: 1.15, y: 0.5, z: -5.1 },
      { x: -1.15, y: 0.5, z: -5.1 },
    ];

    wheelPositions.forEach((pos) => {
      const w = createWheel();
      w.scale.set(1.3, 1.3, 1.3);
      w.position.set(pos.x, pos.y, pos.z);
      if (pos.x > 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    });
  } else if (type === 'suv') {
    // Tall SUV
    length = 4.7;
    width = 2.05;
    height = 1.7;

    const bodyGeo = new THREE.BoxGeometry(width, 0.65, length);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    const cabinGeo = new THREE.BoxGeometry(width * 0.85, 0.7, length * 0.65);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.25, -0.2);
    group.add(cabin);

    const roofGeo = new THREE.BoxGeometry(width * 0.88, 0.08, length * 0.68);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.62, -0.2);
    group.add(roof);

    // Roof rack rails
    const railGeo = new THREE.BoxGeometry(0.06, 0.08, length * 0.55);
    const rail1 = new THREE.Mesh(railGeo, blackTrimMat);
    rail1.position.set(-width * 0.4, 1.7, -0.2);
    group.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, blackTrimMat);
    rail2.position.set(width * 0.4, 1.7, -0.2);
    group.add(rail2);

    // Tail lights
    const tlGeo = new THREE.BoxGeometry(0.35, 0.35, 0.08);
    const ltl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    ltl.position.set(-width * 0.38, 0.8, -length * 0.5);
    group.add(ltl);
    brakeLights.push(ltl);

    const rtl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    rtl.position.set(width * 0.38, 0.8, -length * 0.5);
    group.add(rtl);
    brakeLights.push(rtl);

    // Wheels (4)
    const wheelPositions = [
      { x: -width * 0.5, z: length * 0.3 },
      { x: width * 0.5, z: length * 0.3 },
      { x: -width * 0.5, z: -length * 0.3 },
      { x: width * 0.5, z: -length * 0.3 },
    ];
    wheelPositions.forEach((pos) => {
      const w = createWheel();
      w.scale.set(1.15, 1.15, 1.15);
      w.position.set(pos.x, 0.42, pos.z);
      if (pos.x > 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    });
  } else {
    // Standard Sedan / Sport coupe
    length = type === 'sport' ? 4.3 : 4.5;
    width = 1.9;
    height = 1.3;

    const bodyGeo = new THREE.BoxGeometry(width, 0.48, length);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.48;
    body.castShadow = true;
    group.add(body);

    const cabinGeo = new THREE.BoxGeometry(width * 0.78, 0.54, length * 0.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.94, -0.1);
    group.add(cabin);

    const roofGeo = new THREE.BoxGeometry(width * 0.8, 0.06, length * 0.45);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.23, -0.1);
    group.add(roof);

    // Tail lights
    const tlGeo = new THREE.BoxGeometry(0.4, 0.12, 0.08);
    const ltl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    ltl.position.set(-width * 0.36, 0.58, -length * 0.5);
    group.add(ltl);
    brakeLights.push(ltl);

    const rtl = new THREE.Mesh(tlGeo, tailNormalMat.clone());
    rtl.position.set(width * 0.36, 0.58, -length * 0.5);
    group.add(rtl);
    brakeLights.push(rtl);

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.12, 0.08);
    const lhl = new THREE.Mesh(hlGeo, headlightMat);
    lhl.position.set(-width * 0.36, 0.55, length * 0.5);
    group.add(lhl);

    const rhl = new THREE.Mesh(hlGeo, headlightMat);
    rhl.position.set(width * 0.36, 0.55, length * 0.5);
    group.add(rhl);

    // Wheels
    const wheelPositions = [
      { x: -width * 0.5, z: length * 0.31 },
      { x: width * 0.5, z: length * 0.31 },
      { x: -width * 0.5, z: -length * 0.31 },
      { x: width * 0.5, z: -length * 0.31 },
    ];
    wheelPositions.forEach((pos) => {
      const w = createWheel();
      w.position.set(pos.x, 0.34, pos.z);
      if (pos.x > 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    });
  }

  return {
    group,
    type,
    length,
    width,
    height,
    brakeLights,
    wheels,
  };
}

export function setBrakeLights(lights: THREE.Mesh[], isBraking: boolean) {
  for (let i = 0; i < lights.length; i++) {
    lights[i].material = isBraking ? tailBrakeMat : tailNormalMat;
  }
}
