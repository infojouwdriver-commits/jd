import * as T from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import QRCode from "qrcode";
import { createCar, createPhone, createPrinter } from "./models";
import type { CinematicText } from "./copy";

type Pose = { p: number; camera: number[]; target: number[] };
const poses: Pose[] = [
  { p: 0, camera: [0.15, 1.65, 5.4], target: [0, 1.5, 0] },
  { p: 0.15, camera: [0, 1.6, 3.9], target: [0, 1.5, 0] },
  { p: 0.35, camera: [-5.9, 3.05, 6.1], target: [0, 0.95, 0] },
  { p: 0.52, camera: [-4.6, 2.35, 5.3], target: [-0.15, 1.05, 0] },
  { p: 0.65, camera: [0.42, 1.45, 0.38], target: [-0.88, 1.2, 0.1] },
  { p: 0.73, camera: [0.25, 1.4, 0.36], target: [-0.86, 1.2, 0.12] },
  { p: 0.84, camera: [1.6, 1.8, 3.5], target: [0.1, 1.15, 0] },
  { p: 1, camera: [0.35, 1.9, 4.3], target: [0, 1.45, 0] },
];
export const range = (p: number, a: number, b: number) =>
  T.MathUtils.smoothstep(p, a, b);
function optimize(parent: T.Object3D) {
  parent.children.filter((o) => !(o instanceof T.Mesh)).forEach(optimize);
  const groups = new Map<T.Material, T.Mesh[]>();
  parent.children.forEach((o) => {
    if (o instanceof T.Mesh && !Array.isArray(o.material)) {
      const items = groups.get(o.material) || [];
      items.push(o);
      groups.set(o.material, items);
    }
  });
  groups.forEach((items, material) => {
    if (items.length < 2) return;
    const geometries = items.map((o) => {
      o.updateMatrix();
      return o.geometry.clone().applyMatrix4(o.matrix);
    });
    const merged = mergeGeometries(geometries);
    geometries.forEach((g) => g.dispose());
    if (!merged) return;
    items.forEach((o) => {
      parent.remove(o);
      o.geometry.dispose();
    });
    const m = new T.Mesh(merged, material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
  });
}
export async function mountCinema(
  host: HTMLElement,
  section: HTMLElement,
  t: CinematicText,
  rtl: boolean,
  onProgress: (p: number) => void,
  onFail: () => void,
) {
  gsap.registerPlugin(ScrollTrigger);
  let disposed = false,
    visible = true;
  const low = innerWidth < 760 || (navigator.hardwareConcurrency || 4) <= 4;
  const renderer = new T.WebGLRenderer({
    antialias: !low,
    alpha: true,
    powerPreference: low ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.25 : 1.75));
  renderer.setClearColor("#060B12", 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = !low;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new T.Scene();
  scene.fog = new T.FogExp2("#060B12", 0.027);
  const camera = new T.PerspectiveCamera(36, 1, 0.04, 70);
  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.05);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const ambient = new T.HemisphereLight("#bde5ff", "#14202c", 2);
  scene.add(ambient);
  const key = new T.DirectionalLight("#c6e7ff", 6);
  key.position.set(-3, 7, 5);
  key.castShadow = !low;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.001;
  scene.add(key);
  const warm = new T.PointLight("#EAC080", 45, 18, 2);
  warm.position.set(2, 3, -2);
  scene.add(warm);
  const fill = new T.PointLight("#A9D8F2", 30, 14, 2);
  fill.position.set(-4, 2, 0);
  scene.add(fill);
  const floor = new T.Mesh(
    new T.CircleGeometry(12, 80),
    new T.MeshStandardMaterial({
      color: "#060b12",
      roughness: 0.72,
      metalness: 0.18,
      envMapIntensity: 0.35,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.015;
  floor.receiveShadow = true;
  scene.add(floor);
  const ring = new T.Mesh(
    new T.TorusGeometry(4.4, 0.012, 6, 100),
    new T.MeshBasicMaterial({ color: "#455b6b" }),
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  for (const s of [-1, 1]) {
    const strip = new T.Mesh(
      new T.BoxGeometry(0.035, 3.8, 0.035),
      new T.MeshBasicMaterial({ color: s === 1 ? "#EAC080" : "#A9D8F2" }),
    );
    strip.position.set(s * 4, 1.9, -3);
    strip.rotation.z = s * 0.28;
    scene.add(strip);
  }
  const car = createCar(low);
  optimize(car.group);
  scene.add(car.group);
  const phone = createPhone(t, rtl);
  scene.add(phone.group);
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, "https://jouww.com/#demo-receipt", {
    width: 256,
    margin: 4,
    errorCorrectionLevel: "M",
  });
  const printer = createPrinter(t, qr);
  optimize(printer.group);
  scene.add(printer.group);
  const state = { p: 0 };
  const target = new T.Vector3();
  let lastProgress = -1;
  function render() {
    if (disposed || !visible || document.hidden) return;
    const p = state.p;
    const mobile = host.clientWidth < 600;
    let a = poses[0],
      b = poses[1];
    for (let i = 1; i < poses.length; i++) {
      if (p <= poses[i].p) {
        a = poses[i - 1];
        b = poses[i];
        break;
      }
    }
    const u = T.MathUtils.smoothstep(p, a.p, b.p);
    camera.position
      .fromArray(a.camera)
      .lerp(new T.Vector3(...(b.camera as [number, number, number])), u);
    target
      .fromArray(a.target)
      .lerp(new T.Vector3(...(b.target as [number, number, number])), u);
    if (mobile && p > 0.22 && p < 0.58) camera.position.multiplyScalar(1.32);
    camera.lookAt(target);
    const entry = range(p, 0.2, 0.37);
    car.group.position.x = 8 * (1 - entry);
    car.group.visible = p > 0.2 && p < 0.82;
    car.group.rotation.y = -0.12 + range(p, 0.35, 0.54) * 0.25;
    car.wheels.forEach((w) => (w.rotation.z = (8 * entry) / 0.47));
    car.taxiMaterial.emissiveIntensity = range(p, 0.32, 0.46) * 2;
    car.cabin.visible = p < 0.595; // Remove glazing at the windshield crossing so the cabin remains legible.
    const dock = range(p, 0.34, 0.59);
    phone.group.position.set(
      T.MathUtils.lerp(0, -0.72, dock),
      T.MathUtils.lerp(1.5, 1.26, dock),
      T.MathUtils.lerp(0.1, 0.02, dock),
    );
    phone.group.rotation.y = T.MathUtils.lerp(-0.1, Math.PI / 2, dock);
    phone.group.scale.setScalar(T.MathUtils.lerp(1, 0.24, dock));
    phone.group.visible = p < 0.78;
    phone.update(p);
    const reveal = range(p, 0.76, 0.84);
    printer.group.visible = p > 0.76;
    printer.group.position.set(0, 0.18, -1.4 * (1 - reveal));
    printer.group.rotation.y = -0.25 + 0.4 * range(p, 0.84, 1);
    printer.group.scale.setScalar(0.8 + 0.2 * reveal);
    printer.paper.scale.y = Math.max(0.001, range(p, 0.84, 0.98));
    printer.indicator.emissiveIntensity = range(p, 0.81, 0.86) * 2;
    printer.roller.rotation.x = range(p, 0.84, 0.98) * Math.PI * 5;
    warm.intensity = 25 + range(p, 0.2, 0.48) * 55;
    key.color.set(p < 0.35 ? "#c6e7ff" : "#ffe3b2");
    renderer.render(scene, camera);
    host.dataset.progress = p.toFixed(4);
    if (Math.abs(lastProgress - p) > 0.001) {
      onProgress(p);
      lastProgress = p;
    }
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 600 ? 43 : 36;
    camera.updateProjectionMatrix();
    render();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) render();
    },
    { rootMargin: "100px" },
  );
  observer.observe(host);
  const lost = (event: Event) => {
    event.preventDefault();
    onFail();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const visibility = () => {
    if (!document.hidden) render();
  };
  document.addEventListener("visibilitychange", visibility);
  const tween = gsap.to(state, {
    p: 1,
    ease: "none",
    onUpdate: render,
    scrollTrigger: {
      trigger: section,
      start: "top top+=76",
      end: "bottom bottom",
      scrub: 0.55,
      invalidateOnRefresh: true,
    },
  });
  resize();
  host.dataset.ready = "true";
  return () => {
    disposed = true;
    tween.scrollTrigger?.kill();
    tween.kill();
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>(),
      textures = new Set<T.Texture>();
    scene.traverse((o) => {
      if (o instanceof T.Mesh) {
        geometries.add(o.geometry);
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          materials.add(m),
        );
      }
    });
    materials.forEach((m) => {
      Object.values(m).forEach((v) => {
        if (v instanceof T.Texture) textures.add(v);
      });
      m.dispose();
    });
    geometries.forEach((g) => g.dispose());
    textures.forEach((t) => t.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
