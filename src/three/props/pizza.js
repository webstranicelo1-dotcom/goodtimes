import * as THREE from "three";
import { pizzaTopTexture, crustTexture } from "../utils.js";

/** Nabubrela kora — talasa obod tako da ne izgleda kao savršen torus. */
function swellCrust(geometry) {
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const angle = Math.atan2(v.y, v.x);
    const wobble =
      Math.sin(angle * 7.0) * 0.018 +
      Math.sin(angle * 13.0 + 1.4) * 0.011 +
      Math.sin(angle * 3.0) * 0.015;
    v.multiplyScalar(1 + wobble);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/** Ravan list bosiljka sa šiljatim vrhom. */
function basilLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.07, 0.05, 0.1, 0.17, 0, 0.28);
  shape.bezierCurveTo(-0.1, 0.17, -0.07, 0.05, 0, 0);
  return new THREE.ShapeGeometry(shape, 12);
}

export function createPizza({ envMap, quality }) {
  const group = new THREE.Group();
  const pivot = new THREE.Group();
  group.add(pivot);

  const seg = quality === "low" ? 40 : 80;

  const dough = new THREE.MeshPhysicalMaterial({
    map: crustTexture(quality === "low" ? 256 : 512),
    roughness: 0.82,
    metalness: 0,
    clearcoat: 0.1,
    envMap,
    envMapIntensity: 0.55,
  });

  // obod dobija istu teksturu, ali gušće — mrlje od vatre ostaju sitne
  const rimMap = crustTexture(quality === "low" ? 256 : 512);
  rimMap.repeat.set(7, 1);
  const rimDough = dough.clone();
  rimDough.map = rimMap;

  const board = new THREE.Mesh(
    new THREE.CylinderGeometry(1.74, 1.68, 0.07, seg),
    new THREE.MeshPhysicalMaterial({
      color: 0x150e08,
      roughness: 0.6,
      metalness: 0.1,
      clearcoat: 0.35,
      clearcoatRoughness: 0.45,
      envMap,
      envMapIntensity: 0.8,
    })
  );
  board.position.y = -0.075;
  pivot.add(board);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.42, 0.11, seg), dough);
  base.position.y = 0.015;
  pivot.add(base);

  const crust = new THREE.Mesh(
    swellCrust(new THREE.TorusGeometry(1.44, 0.115, 16, seg)),
    rimDough
  );
  crust.rotation.x = Math.PI / 2;
  crust.position.y = 0.055;
  pivot.add(crust);

  const top = new THREE.Mesh(
    new THREE.CircleGeometry(1.44, seg),
    new THREE.MeshPhysicalMaterial({
      map: pizzaTopTexture(quality === "low" ? 512 : 1024),
      transparent: true,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.32,
      envMap,
      envMapIntensity: 0.85,
    })
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.075;
  pivot.add(top);

  // fior di latte — prave grudve, ne samo tekstura
  const mozzarellaMat = new THREE.MeshPhysicalMaterial({
    color: 0xe9dcba,
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.26,
    sheen: 0.35,
    sheenColor: new THREE.Color(0xfff6df),
    envMap,
    envMapIntensity: 0.95,
  });
  const blobGeo = new THREE.SphereGeometry(1, 18, 12);

  for (let i = 0; i < 16; i++) {
    const blob = new THREE.Mesh(blobGeo, mozzarellaMat);
    const a = (i / 16) * Math.PI * 2 + Math.random() * 0.7;
    const d = 0.22 + Math.sqrt(Math.random()) * 1.05;
    const r = 0.1 + Math.random() * 0.11;
    blob.position.set(Math.cos(a) * d, 0.079, Math.sin(a) * d);
    blob.scale.set(r, r * (0.2 + Math.random() * 0.12), r * (0.7 + Math.random() * 0.45));
    blob.rotation.y = Math.random() * Math.PI;
    pivot.add(blob);
  }

  // bosiljak
  const basilMat = new THREE.MeshPhysicalMaterial({
    color: 0x355a26,
    roughness: 0.38,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
    sheen: 0.7,
    sheenColor: new THREE.Color(0x9ccb72),
    envMap,
    envMapIntensity: 1.0,
    side: THREE.DoubleSide,
  });
  const basilGeo = basilLeafGeometry();

  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(basilGeo, basilMat);
    const a = (i / 7) * Math.PI * 2 + Math.random() * 0.7;
    const d = 0.34 + Math.random() * 0.85;
    leaf.position.set(Math.cos(a) * d, 0.098 + Math.random() * 0.02, Math.sin(a) * d);
    leaf.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.35, 0, Math.random() * Math.PI * 2);
    leaf.scale.setScalar(0.85 + Math.random() * 0.5);
    pivot.add(leaf);
  }

  // čeri paradajz na pola
  const tomatoMat = new THREE.MeshPhysicalMaterial({
    color: 0x9c1f14,
    roughness: 0.2,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMap,
    envMapIntensity: 1.7,
  });
  const tomatoGeo = new THREE.SphereGeometry(0.115, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);

  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(tomatoGeo, tomatoMat);
    const a = (i / 5) * Math.PI * 2 + 0.7;
    const d = 0.55 + Math.random() * 0.6;
    t.position.set(Math.cos(a) * d, 0.09, Math.sin(a) * d);
    t.scale.y = 0.7;
    pivot.add(t);
  }

  return {
    group,
    update(time, { scroll }) {
      pivot.rotation.y = scroll * 5.2 + time * 0.045;
      pivot.rotation.z = Math.sin(time * 0.35) * 0.026;
      pivot.rotation.x = Math.cos(time * 0.28) * 0.02;
      pivot.position.y = Math.sin(time * 0.42 + 1.2) * 0.03;
    },
  };
}
