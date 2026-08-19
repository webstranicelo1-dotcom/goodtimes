import * as THREE from "three";
import { v2 } from "../utils.js";

const GLASS_PROFILE = [
  v2(0.001, 0.0),
  v2(0.36, 0.004),
  v2(0.4, 0.018),
  v2(0.38, 0.032),
  v2(0.2, 0.046),
  v2(0.056, 0.09),
  v2(0.05, 0.58),
  v2(0.078, 0.645),
  v2(0.2, 0.755),
  v2(0.31, 0.9),
  v2(0.356, 1.08),
  v2(0.366, 1.24),
  v2(0.35, 1.38),
];

const WINE_PROFILE = [
  v2(0.001, 0.655),
  v2(0.09, 0.665),
  v2(0.185, 0.74),
  v2(0.275, 0.865),
  v2(0.325, 1.0),
  v2(0.336, 1.06),
  v2(0.001, 1.06),
];

export function createGlass({ envMap, quality }) {
  const group = new THREE.Group();
  const pivot = new THREE.Group();
  group.add(pivot);

  const seg = quality === "low" ? 40 : 84;
  const high = quality === "high";

  const glassMat = high
    ? new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.035,
        transmission: 1,
        thickness: 0.32,
        ior: 1.5,
        specularIntensity: 1,
        envMap,
        envMapIntensity: 1.7,
        side: THREE.DoubleSide,
        transparent: true,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xd8d2ca,
        metalness: 0.25,
        roughness: 0.06,
        envMap,
        envMapIntensity: 2.6,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
      });

  const glass = new THREE.Mesh(new THREE.LatheGeometry(GLASS_PROFILE, seg), glassMat);
  pivot.add(glass);

  const wine = new THREE.Mesh(
    new THREE.LatheGeometry(WINE_PROFILE, seg),
    new THREE.MeshPhysicalMaterial({
      color: 0x63101f,
      roughness: 0.05,
      metalness: 0,
      transmission: high ? 0.75 : 0,
      thickness: 0.6,
      ior: 1.36,
      attenuationColor: new THREE.Color(0x40060f),
      attenuationDistance: 0.55,
      envMap,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: high ? 1 : 0.88,
      side: THREE.DoubleSide,
    })
  );
  pivot.add(wine);

  const coaster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.6, 0.022, seg),
    new THREE.MeshPhysicalMaterial({
      color: 0x120e0a,
      roughness: 0.35,
      metalness: 0.2,
      clearcoat: 0.7,
      envMap,
      envMapIntensity: 1.4,
    })
  );
  coaster.position.y = -0.012;
  pivot.add(coaster);

  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.005, 6, seg),
    new THREE.MeshPhysicalMaterial({
      color: 0xc9974c,
      metalness: 1,
      roughness: 0.22,
      envMap,
      envMapIntensity: 2.2,
    })
  );
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 0.001;
  pivot.add(goldRing);

  // svetlo iza čaše — vino zasija kroz staklo
  const backLight = new THREE.PointLight(0xff8b3a, 4.2, 4.5, 2);
  backLight.position.set(-0.35, 0.95, -0.85);
  pivot.add(backLight);

  return {
    group,
    update(time, { scroll }) {
      pivot.rotation.y = scroll * 2.4;
      pivot.position.y = Math.sin(time * 0.46 + 2.1) * 0.02;
      backLight.intensity = 2.6 + Math.sin(time * 2.3) * 0.4 + Math.sin(time * 5.1) * 0.2;
    },
  };
}
