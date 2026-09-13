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
  exhaustMeshes: THREE.Mesh[];
  exhaustPositions: THREE.Vector3[];
  underglowLight?: THREE.PointLight;
  length: number;
  width: number;
  height: number;
}

// Reusable standard geometries
const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 20);
tireGeo.rotateZ(Math.PI / 2);

const brakeDiscGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16);
brakeDiscGeo.rotateZ(Math.PI / 2);

const caliperGeo = new THREE.BoxGeometry(0.08, 0.14, 0.12);

// Reusable materials
const tireMat = new THREE.MeshStandardMaterial({
  color: 0x171717,
  roughness: 0.9,
  metalness: 0.1,
});

const discMat = new THREE.MeshStandardMaterial({
  color: 0xa1a1aa,
  roughness: 0.25,
  metalness: 0.9,
});

const rimMatSilver = new THREE.MeshStandardMaterial({
  color: 0xe4e4e7,
  roughness: 0.25,
  metalness: 0.9,
});

const rimMatDark = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.35,
  metalness: 0.85,
});

const glassMat = new THREE.MeshStandardMaterial({
  color: 0x050508,
  roughness: 0.05,
  metalness: 0.95,
  transparent: true,
  opacity: 0.85,
});

const interiorMat = new THREE.MeshStandardMaterial({
  color: 0x1c1917,
  roughness: 0.8,
  metalness: 0.2,
});

const carbonMat = new THREE.MeshStandardMaterial({
  color: 0x121214,
  roughness: 0.3,
  metalness: 0.7,
});

const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xf4f4f5,
  metalness: 0.98,
  roughness: 0.1,
});

const headlightMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 1.3,
  roughness: 0.1,
});

const yHeadlightMat = new THREE.MeshStandardMaterial({
  color: 0xfef08a,
  emissive: 0xfacc15,
  emissiveIntensity: 1.5,
  roughness: 0.1,
});

const tailNormalMat = new THREE.MeshStandardMaterial({
  color: 0x7f1d1d,
  emissive: 0xef4444,
  emissiveIntensity: 0.5,
  roughness: 0.2,
});

const tailBrakeMat = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 2.8,
  roughness: 0.1,
});

const engineBlockMat = new THREE.MeshStandardMaterial({
  color: 0xdc2626,
  metalness: 0.8,
  roughness: 0.3,
});

const exhaustTipMat = new THREE.MeshStandardMaterial({
  color: 0x3f3f46,
  metalness: 0.9,
  roughness: 0.2,
});

const exhaustFlameMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.0,
});

function createHighDetailWheel(isDarkRim: boolean, caliperColorHex: number): THREE.Group {
  const wheel = new THREE.Group();

  // Rubber tire with tread profile
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.castShadow = true;
  tire.receiveShadow = true;
  wheel.add(tire);

  // Metal brake disc
  const disc = new THREE.Mesh(brakeDiscGeo, discMat);
  wheel.add(disc);

  // Performance brake caliper
  const caliperMat = new THREE.MeshStandardMaterial({
    color: caliperColorHex,
    roughness: 0.3,
    metalness: 0.6,
  });
  const caliper = new THREE.Mesh(caliperGeo, caliperMat);
  caliper.position.set(0.08, 0.13, 0.05);
  wheel.add(caliper);

  // Outer rim lip
  const activeRimMat = isDarkRim ? rimMatDark : rimMatSilver;
  const rimOuterGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.285, 16);
  rimOuterGeo.rotateZ(Math.PI / 2);
  const rimOuter = new THREE.Mesh(rimOuterGeo, activeRimMat);
  wheel.add(rimOuter);

  // Center hubcap
  const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.29, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, chromeMat);
  wheel.add(hub);

  // 5 Twin-Spoke Star Design
  const spokeCount = 5;
  for (let s = 0; s < spokeCount; s++) {
    const angle = (s / spokeCount) * Math.PI * 2;
    const spokeGeo = new THREE.BoxGeometry(0.04, 0.2, 0.035);
    const spoke = new THREE.Mesh(spokeGeo, activeRimMat);
    spoke.position.set(0.12, Math.cos(angle) * 0.11, Math.sin(angle) * 0.11);
    spoke.rotation.x = -angle;
    wheel.add(spoke);
  }

  return wheel;
}

export function buildPlayerCar(carDef: CarDefinition, paintHex?: string): CarMeshBundle {
  const group = new THREE.Group();
  group.name = `PlayerCar_${carDef.id}`;

  const paintColor = new THREE.Color(paintHex || carDef.defaultColor);
  const bodyPaintMat = new THREE.MeshStandardMaterial({
    color: paintColor,
    roughness: 0.24,
    metalness: 0.82,
  });

  const brakeLights: THREE.Mesh[] = [];
  const headlights: THREE.Mesh[] = [];
  const exhaustPositions: THREE.Vector3[] = [];
  const exhaustMeshes: THREE.Mesh[] = [];

  // Determine car archetype styling
  const isMonza = carDef.id === 'monza-sp';
  const isVeneno = carDef.id === 'veneno-sv';
  const isFerrari = carDef.id === 'scuderia-f8' || isMonza;
  const isLambo = carDef.id === 'toro-sv' || isVeneno;
  const isHyper = carDef.id === 'nemesis-hyper' || isVeneno || carDef.id === 'valkyrie-lm';
  const isSuper = carDef.id === 'phantom-rs';
  const isMuscle = carDef.id === 'thunder-v8';

  // New archetypes: Vans, GT-R, Le Mans Hypercar
  const isVan = carDef.category === 'van' || carDef.id.startsWith('van-');
  const isApexCargo = carDef.id === 'van-apex-cargo';
  const isDajiban = carDef.id === 'van-dajiban-drift';
  const isCyberHauler = carDef.id === 'van-cyber-hauler';
  const isGTR = carDef.id === 'tsunami-gtr';
  const isValkyrie = carDef.id === 'valkyrie-lm';

  // Caliper color
  const caliperColor = isFerrari
    ? 0xdc2626
    : isLambo
    ? 0xeab308
    : isHyper
    ? 0x06b6d4
    : isDajiban
    ? 0xca8a04
    : isGTR
    ? 0xca8a04
    : 0xef4444;
  const isDarkRim = isLambo || isHyper || isSuper || isDajiban || isCyberHauler || isGTR;

  // Car overall dimensions
  const length = isValkyrie
    ? 4.95
    : isCyberHauler
    ? 4.9
    : isApexCargo || isDajiban
    ? 4.8
    : isVeneno
    ? 4.9
    : isLambo
    ? 4.75
    : isHyper
    ? 4.85
    : isMuscle
    ? 4.7
    : isGTR
    ? 4.65
    : isFerrari
    ? 4.6
    : 4.45;
  const width = isDajiban
    ? 2.12
    : isApexCargo || isCyberHauler
    ? 2.05
    : isVeneno
    ? 2.08
    : isLambo
    ? 2.05
    : isHyper
    ? 2.02
    : isGTR
    ? 2.0
    : 1.95;
  const height = isApexCargo
    ? 2.05
    : isCyberHauler
    ? 1.82
    : isDajiban
    ? 1.68
    : isMonza
    ? 1.06
    : isValkyrie
    ? 1.08
    : isVeneno
    ? 1.15
    : isLambo
    ? 1.16
    : isHyper
    ? 1.14
    : isFerrari
    ? 1.18
    : isMuscle
    ? 1.34
    : 1.25;

  // 1. Lower Chassis
  const chassisHeight = isApexCargo ? 0.52 : isCyberHauler ? 0.46 : 0.42;
  const chassisGeo = new THREE.BoxGeometry(width * 0.94, chassisHeight, length * 0.95);
  const bodyMesh = new THREE.Mesh(chassisGeo, bodyPaintMat);
  bodyMesh.position.y = 0.44;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Aerodynamic Side Skirts (Carbon)
  const skirtGeo = new THREE.BoxGeometry(width * 0.99, 0.08, length * 0.65);
  const sideSkirts = new THREE.Mesh(skirtGeo, carbonMat);
  sideSkirts.position.set(0, 0.24, 0);
  group.add(sideSkirts);

  // 3. Cabin & Greenhouse
  const cabinWidth = width * 0.74;
  const cabinLength = length * (isMuscle ? 0.52 : isLambo ? 0.42 : 0.46);
  const cabinHeight = height * 0.46;
  const cabinZ = isLambo ? 0.08 : isFerrari ? 0.02 : isMuscle ? -0.15 : -0.05;

  if (isMonza) {
    // Open Cockpit Speedster: Low wind deflector, exposed tub
    const screenGeo = new THREE.BoxGeometry(cabinWidth * 0.95, 0.12, 0.15);
    const aeroScreen = new THREE.Mesh(screenGeo, glassMat);
    aeroScreen.position.set(0, 0.78, cabinZ + cabinLength * 0.35);
    aeroScreen.rotation.x = -0.3;
    group.add(aeroScreen);

    // Twin streamliner humps behind driver and passenger
    [-0.32, 0.32].forEach((hx) => {
      const humpGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.72, 16);
      humpGeo.rotateX(Math.PI / 2);
      const hump = new THREE.Mesh(humpGeo, bodyPaintMat);
      hump.position.set(hx, 0.82, cabinZ - 0.25);
      group.add(hump);
    });

    // White racing livery center stripe
    const stripeGeo = new THREE.BoxGeometry(0.32, 0.02, length * 0.88);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0.68, 0);
    group.add(stripe);
  } else {
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.88, cabinZ);
    cabin.castShadow = true;
    group.add(cabin);

    // 4. Roof panel
    const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.94, 0.05, cabinLength * 0.82);
    const roof = new THREE.Mesh(roofGeo, bodyPaintMat);
    roof.position.set(0, 0.88 + cabinHeight * 0.5 + 0.02, cabinZ);
    group.add(roof);
  }

  // Interior detail: Steering wheel and headrests visible through glass
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 8, 16), interiorMat);
  wheelRim.position.set(-0.32, 0.82, cabinZ + cabinLength * 0.22);
  wheelRim.rotation.x = Math.PI / 4;
  group.add(wheelRim);

  const headrestGeo = new THREE.BoxGeometry(0.2, 0.22, 0.12);
  const leftHeadrest = new THREE.Mesh(headrestGeo, interiorMat);
  leftHeadrest.position.set(-0.32, 0.86, cabinZ - 0.05);
  group.add(leftHeadrest);

  const rightHeadrest = new THREE.Mesh(headrestGeo, interiorMat);
  rightHeadrest.position.set(0.32, 0.86, cabinZ - 0.05);
  group.add(rightHeadrest);

  // 4. Roof panel
  const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.94, 0.05, cabinLength * 0.82);
  const roof = new THREE.Mesh(roofGeo, bodyPaintMat);
  roof.position.set(0, 0.88 + cabinHeight * 0.5 + 0.02, cabinZ);
  group.add(roof);

  // 5. Front Hood
  const hoodLength = length * 0.35;
  const hoodGeo = new THREE.BoxGeometry(width * 0.88, 0.22, hoodLength);
  const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
  hood.position.set(0, 0.56, length * 0.32);
  hood.rotation.x = isLambo ? 0.12 : 0.07;
  group.add(hood);

  // 6. Front Splitter / Carbon Aero Valance
  const splitterGeo = new THREE.BoxGeometry(width * 0.95, 0.06, 0.4);
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.position.set(0, 0.22, length * 0.48);
  group.add(splitter);

  // 7. Rear Diffuser with vertical fins
  const diffuserGeo = new THREE.BoxGeometry(width * 0.92, 0.22, 0.35);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuser.position.set(0, 0.3, -length * 0.49);
  group.add(diffuser);

  // Diffuser vertical fins
  [-0.55, -0.2, 0.2, 0.55].forEach((fx) => {
    const finGeo = new THREE.BoxGeometry(0.04, 0.18, 0.32);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(fx, 0.26, -length * 0.49);
    group.add(fin);
  });

  // -------------------------------------------------------------
  // BESPOKE ARCHETYPES: FERRARI, LAMBORGHINI, HYPERCAR, MUSCLE
  // -------------------------------------------------------------
  if (isFerrari) {
    // FERRARI GRACE: Sculpted S-Duct hood channel, side air intakes, visible mid-engine V8, round halo taillights
    // S-Duct hood scoop
    const sductGeo = new THREE.BoxGeometry(0.55, 0.12, 0.7);
    const sduct = new THREE.Mesh(sductGeo, carbonMat);
    sduct.position.set(0, 0.62, length * 0.32);
    group.add(sduct);

    // Front badge crest (yellow triangle/rectangle)
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), badgeMat);
    badge.position.set(0, 0.54, length * 0.485);
    group.add(badge);

    // Side air intakes behind doors
    const intakeGeo = new THREE.BoxGeometry(0.12, 0.26, 0.55);
    const leftIntake = new THREE.Mesh(intakeGeo, carbonMat);
    leftIntake.position.set(-width * 0.47, 0.55, -0.4);
    group.add(leftIntake);
    const rightIntake = new THREE.Mesh(intakeGeo, carbonMat);
    rightIntake.position.set(width * 0.47, 0.55, -0.4);
    group.add(rightIntake);

    // Rear engine deck with glass cover showing red-cylinder-head Ferrari V8
    const engineGlass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.62, 0.04, 0.9), glassMat);
    engineGlass.position.set(0, 0.72, -length * 0.22);
    group.add(engineGlass);

    // Red cylinder heads & intake manifold
    const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.15, 0.65), engineBlockMat);
    engineBlock.position.set(0, 0.62, -length * 0.22);
    group.add(engineBlock);

    // Ferrari ducktail active spoiler
    const spoilerGeo = new THREE.BoxGeometry(width * 0.88, 0.1, 0.28);
    const spoiler = new THREE.Mesh(spoilerGeo, bodyPaintMat);
    spoiler.position.set(0, 0.78, -length * 0.46);
    spoiler.rotation.x = -0.15;
    group.add(spoiler);

    // Ferrari signature Quad Round Halo Taillights
    const roundTailGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16);
    roundTailGeo.rotateX(Math.PI / 2);

    [-width * 0.38, -width * 0.24, width * 0.24, width * 0.38].forEach((tx) => {
      const tl = new THREE.Mesh(roundTailGeo, tailNormalMat.clone());
      tl.position.set(tx, 0.6, -length * 0.495);
      group.add(tl);
      brakeLights.push(tl);
    });

    // Ferrari dual center-mounted large titanium exhausts
    [-0.26, 0.26].forEach((ex) => {
      const exMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), chromeMat);
      exMesh.rotation.x = Math.PI / 2;
      exMesh.position.set(ex, 0.42, -length * 0.5);
      group.add(exMesh);
      exhaustPositions.push(new THREE.Vector3(ex, 0.42, -length * 0.5 - 0.15));

      // Nitro glow flame cone
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 10), exhaustFlameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.42, -length * 0.5 - 0.3);
      group.add(flame);
      exhaustMeshes.push(flame);
    });
  } else if (isLambo) {
    // LAMBORGHINI GRACE: Stealth fighter facets, Y-shaped DRL lights, massive swan-neck GT spoiler, roof scoop, center hex exhausts
    // Roof air scoop
    const scoopGeo = new THREE.BoxGeometry(0.36, 0.16, 0.85);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(0, 1.18, 0.1);
    group.add(scoop);

    // Front aggressive aero canards on bumper
    [-1, 1].forEach((side) => {
      const canardGeo = new THREE.BoxGeometry(0.25, 0.04, 0.3);
      const canard = new THREE.Mesh(canardGeo, carbonMat);
      canard.position.set(side * width * 0.46, 0.42, length * 0.44);
      canard.rotation.z = side * 0.25;
      group.add(canard);
    });

    // Massive Lamborghini Swan-Neck High Carbon Spoiler
    const wingWidth = width * 1.02;
    const wingGeo = new THREE.BoxGeometry(wingWidth, 0.07, 0.45);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.15, -length * 0.46);
    group.add(wing);

    // Wing endplates
    [-wingWidth * 0.5, wingWidth * 0.5].forEach((wx) => {
      const plateGeo = new THREE.BoxGeometry(0.04, 0.26, 0.48);
      const plate = new THREE.Mesh(plateGeo, carbonMat);
      plate.position.set(wx, 1.18, -length * 0.46);
      group.add(plate);
    });

    // Swan neck mounting pylons
    [-0.45, 0.45].forEach((px) => {
      const pylonGeo = new THREE.BoxGeometry(0.05, 0.45, 0.2);
      const pylon = new THREE.Mesh(pylonGeo, carbonMat);
      pylon.position.set(px, 0.95, -length * 0.44);
      pylon.rotation.x = -0.2;
      group.add(pylon);
    });

    // Lamborghini Center High Dual Exhausts
    [-0.14, 0.14].forEach((ex) => {
      const exMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.25, 6), exhaustTipMat);
      exMesh.rotation.x = Math.PI / 2;
      exMesh.position.set(ex, 0.58, -length * 0.495);
      group.add(exMesh);
      exhaustPositions.push(new THREE.Vector3(ex, 0.58, -length * 0.5 - 0.15));

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 10), exhaustFlameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.58, -length * 0.5 - 0.35);
      group.add(flame);
      exhaustMeshes.push(flame);
    });

    // Lamborghini signature Y-shaped rear taillights
    [-width * 0.35, width * 0.35].forEach((tx) => {
      const yTailGeo = new THREE.BoxGeometry(0.48, 0.1, 0.06);
      const tl = new THREE.Mesh(yTailGeo, tailNormalMat.clone());
      tl.position.set(tx, 0.62, -length * 0.49);
      group.add(tl);
      brakeLights.push(tl);
    });

    // Veneno specific extreme dorsal fin & red racing edge
    if (isVeneno) {
      const dorsalFinGeo = new THREE.BoxGeometry(0.04, 0.38, 1.55);
      const fin = new THREE.Mesh(dorsalFinGeo, carbonMat);
      fin.position.set(0, 1.14, -0.4);
      group.add(fin);

      // Red racing pinstripe on top edge
      const redTrimMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.7 });
      const finEdge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 1.55), redTrimMat);
      finEdge.position.set(0, 1.34, -0.4);
      group.add(finEdge);

      // Red front splitter trim
      const splitEdge = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.025, 0.05), redTrimMat);
      splitEdge.position.set(0, 0.22, length * 0.5);
      group.add(splitEdge);
    }
  } else if (isHyper) {
    // PROTOTYPE HYPERCAR: Central shark dorsal fin, extreme active wing, wide front laser bar
    const finGeo = new THREE.BoxGeometry(0.04, 0.36, 1.4);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(0, 1.08, -0.6);
    group.add(fin);

    const wingGeo = new THREE.BoxGeometry(width * 1.05, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.05, -length * 0.46);
    group.add(wing);

    // Quad center exhaust array
    [-0.18, -0.06, 0.06, 0.18].forEach((ex) => {
      const exMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 10), chromeMat);
      exMesh.rotation.x = Math.PI / 2;
      exMesh.position.set(ex, 0.48, -length * 0.5);
      group.add(exMesh);
      exhaustPositions.push(new THREE.Vector3(ex, 0.48, -length * 0.5 - 0.15));

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 8), exhaustFlameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.48, -length * 0.5 - 0.25);
      group.add(flame);
      exhaustMeshes.push(flame);
    });

    // Thin horizontal laser taillight across entire rear
    const laserTailGeo = new THREE.BoxGeometry(width * 0.85, 0.06, 0.08);
    const tl = new THREE.Mesh(laserTailGeo, tailNormalMat.clone());
    tl.position.set(0, 0.62, -length * 0.495);
    group.add(tl);
    brakeLights.push(tl);
  } else if (isMuscle) {
    // MUSCLE CAR: Cowl induction scoop, dual matte black stripes, wide tires
    const scoopGeo = new THREE.BoxGeometry(0.62, 0.16, 0.95);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(0, 0.76, 1.1);
    group.add(scoop);

    // Racing stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    [-0.26, 0.26].forEach((sx) => {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.18, length * 0.82), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(sx, 0.74, 0.2);
      group.add(stripe);
    });

    // Muscle dual chrome exhaust tips
    [-0.45, 0.45].forEach((ex) => {
      const exMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 10), chromeMat);
      exMesh.rotation.x = Math.PI / 2;
      exMesh.position.set(ex, 0.28, -length * 0.495);
      group.add(exMesh);
      exhaustPositions.push(new THREE.Vector3(ex, 0.28, -length * 0.5 - 0.15));

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), exhaustFlameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.28, -length * 0.5 - 0.25);
      group.add(flame);
      exhaustMeshes.push(flame);
    });

    // Muscle 3-bar vertical taillights
    [-width * 0.35, width * 0.35].forEach((tx) => {
      const mTailGeo = new THREE.BoxGeometry(0.38, 0.16, 0.08);
      const tl = new THREE.Mesh(mTailGeo, tailNormalMat.clone());
      tl.position.set(tx, 0.62, -length * 0.495);
      group.add(tl);
      brakeLights.push(tl);
    });
  } else {
    // Default sports / super: Standard GT wing and dual exhausts
    const wingGeo = new THREE.BoxGeometry(width * 0.94, 0.06, 0.36);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.02, -length * 0.44);
    group.add(wing);

    [-0.4, 0.4].forEach((ex) => {
      const exMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), chromeMat);
      exMesh.rotation.x = Math.PI / 2;
      exMesh.position.set(ex, 0.32, -length * 0.49);
      group.add(exMesh);
      exhaustPositions.push(new THREE.Vector3(ex, 0.32, -length * 0.5 - 0.15));

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), exhaustFlameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(ex, 0.32, -length * 0.5 - 0.25);
      group.add(flame);
      exhaustMeshes.push(flame);
    });

    // Dual horizontal LED bars
    [-width * 0.35, width * 0.35].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.08), tailNormalMat.clone());
      tl.position.set(tx, 0.58, -length * 0.495);
      group.add(tl);
      brakeLights.push(tl);
    });
  }

  // 8. Headlights Signature
  if (isLambo) {
    // Lamborghini Y-Shaped illuminated blades
    [-width * 0.36, width * 0.36].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.12), yHeadlightMat);
      hl.position.set(hx, 0.52, length * 0.47);
      group.add(hl);
      headlights.push(hl);
    });
  } else {
    // High-output projector LED headlights
    [-width * 0.36, width * 0.36].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.1), headlightMat);
      hl.position.set(hx, 0.54, length * 0.475);
      group.add(hl);
      headlights.push(hl);
    });
  }

  // 9. Aerodynamic Wing Mirrors
  const mirrorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.12);
  const leftMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  leftMirror.position.set(-width * 0.52, 0.78, cabinZ + 0.35);
  group.add(leftMirror);

  const rightMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  rightMirror.position.set(width * 0.52, 0.78, cabinZ + 0.35);
  group.add(rightMirror);

  // 10. Underglow Neon System
  const underglowLight = new THREE.PointLight(paintColor, 1.2, 5.5);
  underglowLight.position.set(0, 0.18, 0);
  group.add(underglowLight);

  // 11. High-Detail Wheels with Colored Calipers & Spoke Hubs
  const wheelX = width * 0.51;
  const wheelY = 0.35;
  const frontZ = length * 0.31;
  const rearZ = -length * 0.3;

  const frontLeftWheel = createHighDetailWheel(isDarkRim, caliperColor);
  frontLeftWheel.position.set(-wheelX, wheelY, frontZ);
  group.add(frontLeftWheel);

  const frontRightWheel = createHighDetailWheel(isDarkRim, caliperColor);
  frontRightWheel.position.set(wheelX, wheelY, frontZ);
  frontRightWheel.rotation.y = Math.PI;
  group.add(frontRightWheel);

  const rearLeftWheel = createHighDetailWheel(isDarkRim, caliperColor);
  rearLeftWheel.position.set(-wheelX, wheelY, rearZ);
  group.add(rearLeftWheel);

  const rearRightWheel = createHighDetailWheel(isDarkRim, caliperColor);
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
    exhaustMeshes,
    exhaustPositions,
    underglowLight,
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
  0xf43f5e, // Rose Red
  0x2563eb, // Apex Blue
  0xe2e8f0, // White pearl
  0x64748b, // Slate gray
  0x1e293b, // Deep charcoal
  0xeab308, // Taxi Yellow
  0x10b981, // Emerald
  0x7c3aed, // Purple
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
    roughness: 0.32,
    metalness: 0.72,
  });

  const brakeLights: THREE.Mesh[] = [];
  const wheels: THREE.Group[] = [];

  let length = 4.4;
  let width = 1.9;
  let height = 1.35;

  if (type === 'truck') {
    // Semi-trailer truck (Cab + Long 18-wheel cargo trailer)
    length = 11.2;
    width = 2.45;
    height = 3.65;

    // Cab
    const cabMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 });
    const cabGeo = new THREE.BoxGeometry(2.35, 2.6, 2.9);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.8, 3.8);
    cab.castShadow = true;
    group.add(cab);

    // Windshield
    const wind = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 0.2), glassMat);
    wind.position.set(0, 2.3, 5.26);
    group.add(wind);

    // Chrome Grill
    const grill = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.15, 0.15), chromeMat);
    grill.position.set(0, 1.2, 5.26);
    group.add(grill);

    // Vertical Exhaust Stacks
    [-1.12, 1.12].forEach((sx) => {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8), chromeMat);
      stack.position.set(sx, 2.8, 2.4);
      group.add(stack);
    });

    // Trailer
    const trailerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5, metalness: 0.2 });
    const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.45, 2.75, 7.8), trailerMat);
    trailer.position.set(0, 2.2, -1.6);
    trailer.castShadow = true;
    group.add(trailer);

    // Red Safety Stripes
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.47, 0.2, 7.7), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    stripe.position.set(0, 1.3, -1.6);
    group.add(stripe);

    // Rear brake lights
    [-0.85, 0.85].forEach((lx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.1), tailNormalMat.clone());
      tl.position.set(lx, 1.0, -5.55);
      group.add(tl);
      brakeLights.push(tl);
    });

    // 8 Truck Wheels
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
      const w = createHighDetailWheel(true, 0x52525b);
      w.scale.set(1.3, 1.3, 1.3);
      w.position.set(pos.x, pos.y, pos.z);
      if (pos.x > 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    });
  } else if (type === 'suv') {
    // Full-size SUV
    length = 4.75;
    width = 2.05;
    height = 1.72;

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, 0.65, length), bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, 0.72, length * 0.65), glassMat);
    cabin.position.set(0, 1.25, -0.2);
    group.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.08, length * 0.68), bodyMat);
    roof.position.set(0, 1.63, -0.2);
    group.add(roof);

    // Roof rails
    [-width * 0.4, width * 0.4].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, length * 0.55), carbonMat);
      rail.position.set(rx, 1.71, -0.2);
      group.add(rail);
    });

    // Tail lights
    [-width * 0.38, width * 0.38].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.08), tailNormalMat.clone());
      tl.position.set(tx, 0.8, -length * 0.5);
      group.add(tl);
      brakeLights.push(tl);
    });

    // SUV Wheels
    [
      { x: -width * 0.5, z: length * 0.3 },
      { x: width * 0.5, z: length * 0.3 },
      { x: -width * 0.5, z: -length * 0.3 },
      { x: width * 0.5, z: -length * 0.3 },
    ].forEach((pos) => {
      const w = createHighDetailWheel(false, 0xdc2626);
      w.scale.set(1.15, 1.15, 1.15);
      w.position.set(pos.x, 0.42, pos.z);
      if (pos.x > 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    });
  } else {
    // Sedan / Sports traffic
    length = type === 'sport' ? 4.35 : 4.55;
    width = 1.92;
    height = 1.32;

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, 0.48, length), bodyMat);
    body.position.y = 0.48;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.78, 0.54, length * 0.5), glassMat);
    cabin.position.set(0, 0.94, -0.1);
    group.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 0.06, length * 0.45), bodyMat);
    roof.position.set(0, 1.23, -0.1);
    group.add(roof);

    // Tail lights
    [-width * 0.36, width * 0.36].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), tailNormalMat.clone());
      tl.position.set(tx, 0.58, -length * 0.5);
      group.add(tl);
      brakeLights.push(tl);
    });

    // Wheels
    [
      { x: -width * 0.5, z: length * 0.31 },
      { x: width * 0.5, z: length * 0.31 },
      { x: -width * 0.5, z: -length * 0.31 },
      { x: width * 0.5, z: -length * 0.31 },
    ].forEach((pos) => {
      const w = createHighDetailWheel(true, 0xef4444);
      w.position.set(pos.x, 0.35, pos.z);
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
