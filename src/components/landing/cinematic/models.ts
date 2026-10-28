import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { CinematicText } from "./copy";

// Original parametric automotive design, authored for JOUW DRIVER. See ASSETS.md.
const metal = (color: string, roughness = 0.25, metalness = 0.85) =>
  new T.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
  });
function mesh(
  g: T.BufferGeometry,
  m: T.Material,
  parent: T.Object3D,
  p: number[] = [0, 0, 0],
) {
  const o = new T.Mesh(g, m);
  o.position.set(p[0], p[1], p[2]);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
function box(
  parent: T.Object3D,
  size: number[],
  p: number[],
  material: T.Material,
  radius = 0.04,
) {
  return mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius),
    material,
    parent,
    p,
  );
}
function tube(
  parent: T.Object3D,
  points: number[][],
  material: T.Material,
  radius = 0.012,
) {
  return mesh(
    new T.TubeGeometry(
      new T.CatmullRomCurve3(
        points.map((p) => new T.Vector3(...(p as [number, number, number]))),
      ),
      48,
      radius,
      6,
      false,
    ),
    material,
    parent,
  );
}
function surface(rows: number[][][], material: T.Material, parent: T.Object3D) {
  const v: number[] = [],
    indices: number[] = [];
  const width = rows[0].length;
  rows.forEach((row) => row.forEach((p) => v.push(...p)));
  for (let i = 0; i < rows.length - 1; i++)
    for (let j = 0; j < width - 1; j++) {
      const a = i * width + j;
      indices.push(a, a + width, a + 1, a + 1, a + width, a + width + 1);
    }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(v, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return mesh(g, material, parent);
}
export function textTexture(
  text: string,
  foreground = "#EAC080",
  background = "#0B1929",
  w = 1024,
  h = 256,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  if (background) {
    c.fillStyle = background;
    c.fillRect(0, 0, w, h);
  }
  c.fillStyle = foreground;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `600 ${h * 0.38}px system-ui`;
  c.fillText(text, w / 2, h / 2, w * 0.92);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
export function createCar(low: boolean) {
  const group = new T.Group();
  group.name = "JD Aster concept sedan";
  const paint = metal("#536777", 0.23),
    chrome = metal("#b5c0cb", 0.2),
    dark = new T.MeshStandardMaterial({
      color: "#070d13",
      roughness: 0.88,
      metalness: 0.05,
    }),
    rubber = new T.MeshStandardMaterial({ color: "#10151b", roughness: 0.92 });
  const glass = new T.MeshPhysicalMaterial({
    color: "#0b2637",
    metalness: 0.5,
    roughness: 0.1,
    clearcoat: 1,
    transparent: true,
    opacity: 0.86,
    side: T.DoubleSide,
  });
  const led = new T.MeshStandardMaterial({
    color: "#b6e9ff",
    emissive: "#9fdcf6",
    emissiveIntensity: 3,
  });
  const red = new T.MeshStandardMaterial({
    color: "#ff3544",
    emissive: "#ff1524",
    emissiveIntensity: 2,
  });
  const n = low ? 40 : 72,
    top: number[][][] = [],
    sideA: number[][][] = [],
    sideB: number[][][] = [];
  for (let i = 0; i <= n; i++) {
    const x = -2.65 + (i / n) * 5.3;
    const width =
      0.96 * Math.pow(Math.max(0.02, 1 - Math.pow(Math.abs(x) / 2.85, 6)), 0.3);
    const y = 1.02 + 0.17 * Math.sin(((x + 2.65) / 5.3) * Math.PI);
    const row: number[][] = [];
    for (let j = 0; j <= 20; j++) {
      const z = (-1 + j / 10) * width;
      const interior = x > -1.43 && x < 1.35 && Math.abs(z) < 0.81;
      row.push([x, interior ? 0.4 : y + 0.11 * (1 - (z / width) ** 2), z]);
    }
    top.push(row);
    const arch = Math.max(
      ...[-1.66, 1.61].map((a) =>
        Math.abs(x - a) < 0.53
          ? 0.48 + Math.sqrt(0.53 ** 2 - (x - a) ** 2)
          : 0.38,
      ),
    );
    sideA.push([
      [x, y, width],
      [x, (y + arch) / 2, width + 0.022],
      [x, arch, width * 0.98],
    ]);
    sideB.push([
      [x, arch, -width * 0.98],
      [x, (y + arch) / 2, -width - 0.022],
      [x, y, -width],
    ]);
  }
  paint.side = T.DoubleSide;
  surface(top, paint, group);
  surface(sideA, paint, group);
  surface(sideB, paint, group);
  box(group, [4.05, 0.12, 1.72], [0, 0.32, 0], dark);
  box(group, [0.23, 0.35, 1.62], [-2.48, 0.66, 0], paint, 0.1);
  box(group, [0.22, 0.35, 1.62], [2.48, 0.66, 0], paint, 0.1);
  // Curved glass greenhouse, panoramic roof, independently removable for cabin camera.
  const cabin = new T.Group();
  group.add(cabin);
  const roof: number[][][] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32,
      x = -1.52 + t * 2.95;
    const y = 1.17 + 0.66 * Math.min(1, Math.min(t / 0.29, (1 - t) / 0.25));
    const w = 0.82;
    const row: number[][] = [];
    for (let j = 0; j <= 24; j++) {
      const q = -1 + j / 12;
      row.push([
        x,
        Math.abs(q) < 0.75
          ? y - 0.035 * (q / 0.75) ** 2
          : 1.17 + ((y - 1.205) * (1 - Math.abs(q))) / 0.25,
        w * q,
      ]);
    }
    roof.push(row);
  }
  surface(roof, glass, cabin);
  for (const s of [-1, 1]) {
    tube(
      cabin,
      [
        [-1.52, 1.17, s * 0.82],
        [-0.85, 1.76, s * 0.61],
        [-0.55, 1.8, s * 0.62],
        [0.55, 1.8, s * 0.62],
        [1.43, 1.17, s * 0.82],
      ],
      chrome,
      0.022,
    );
    tube(
      group,
      [
        [-2.4, 0.9, s * 0.87],
        [-1.5, 1.05, s * 0.98],
        [0.5, 1.06, s * 0.98],
        [2.35, 0.95, s * 0.87],
      ],
      chrome,
      0.012,
    );
    tube(
      cabin,
      [
        [0.2, 1.19, s * 0.82],
        [0.18, 1.55, s * 0.76],
        [0.15, 1.81, s * 0.62],
      ],
      dark,
      0.035,
    );
    for (const x of [-0.6, 0.9]) {
      tube(
        group,
        [
          [x, 1.13, s * 0.97],
          [x - 0.04, 0.93, s * 0.99],
          [x - 0.07, 0.55, s * 0.98],
        ],
        dark,
        0.006,
      );
      box(
        group,
        [0.23, 0.024, 0.03],
        [x - 0.25, 1.04, s * 0.993],
        chrome,
        0.01,
      );
    }
    box(group, [0.29, 0.12, 0.19], [-1.05, 1.2, s * 1.04], paint, 0.05);
    const brand = mesh(
      new T.PlaneGeometry(0.78, 0.14),
      new T.MeshBasicMaterial({
        map: textTexture("JOUW DRIVER", "#EAC080", ""),
        transparent: true,
        toneMapped: false,
        side: T.DoubleSide,
      }),
      group,
      [0.18, 0.88, s * 1.001],
    );
    brand.rotation.y = s === 1 ? 0 : Math.PI;
  }
  // Front and rear signatures, grille and aero details.
  tube(
    group,
    [
      [-2.58, 0.98, -0.75],
      [-2.65, 1.02, 0],
      [-2.58, 0.98, 0.75],
    ],
    led,
    0.024,
  );
  tube(
    group,
    [
      [2.58, 1.01, -0.8],
      [2.65, 1.06, 0],
      [2.58, 1.01, 0.8],
    ],
    red,
    0.022,
  );
  for (const s of [-1, 1]) {
    box(group, [0.04, 0.13, 0.33], [-2.61, 0.86, s * 0.64], dark);
    for (let i = 0; i < 4; i++)
      box(
        group,
        [0.05, 0.012, 0.2],
        [-2.64, 0.82 + i * 0.026, s * 0.64],
        chrome,
        0.004,
      );
  }
  box(group, [0.04, 0.12, 0.6], [-2.62, 0.6, 0], dark);
  for (let j = 0; j < 14; j++)
    box(
      group,
      [0.04, 0.09, 0.012],
      [-2.65, 0.6, -0.26 + j * 0.04],
      chrome,
      0.002,
    );
  const plate = mesh(
    new T.PlaneGeometry(0.43, 0.1),
    new T.MeshBasicMaterial({
      map: textTexture("JOUW DRIVER", "#233244", "#eef3f5"),
    }),
    group,
    [-2.677, 0.77, 0],
  );
  plate.rotation.y = -Math.PI / 2;
  const wheels: T.Group[] = [];
  for (const x of [-1.66, 1.61])
    for (const s of [-1, 1]) {
      const wheel = new T.Group();
      wheel.position.set(x, 0.48, s * 0.94);
      group.add(wheel);
      wheels.push(wheel);
      mesh(new T.TorusGeometry(0.365, 0.105, 12, low ? 32 : 64), rubber, wheel);
      mesh(
        new T.CylinderGeometry(0.305, 0.305, 0.16, 48),
        chrome,
        wheel,
      ).rotation.x = Math.PI / 2;
      mesh(
        new T.CylinderGeometry(0.27, 0.27, 0.17, 48),
        dark,
        wheel,
      ).rotation.x = Math.PI / 2;
      const disk = mesh(
        new T.CylinderGeometry(0.235, 0.235, 0.185, 40),
        metal("#646f78", 0.55),
        wheel,
      );
      disk.rotation.x = Math.PI / 2;
      for (let j = 0; j < 10; j++) {
        const a = (j / 10) * Math.PI * 2;
        const spoke = box(
          wheel,
          [0.055, 0.29, 0.04],
          [Math.sin(a) * 0.15, Math.cos(a) * 0.15, s * 0.12],
          chrome,
          0.01,
        );
        spoke.rotation.z = -a;
      }
      mesh(new T.SphereGeometry(0.075, 16, 8), chrome, wheel, [0, 0, s * 0.15]);
      for (let j = 0; j < (low ? 32 : 64); j++) {
        const a = (j / (low ? 32 : 64)) * Math.PI * 2;
        const tread = box(
          wheel,
          [0.027, 0.01, 0.145],
          [Math.sin(a) * 0.466, Math.cos(a) * 0.466, 0],
          dark,
          0.003,
        );
        tread.rotation.z = -a;
      }
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * Math.PI * 2;
        mesh(new T.SphereGeometry(0.013, 6, 4), dark, wheel, [
          Math.sin(a) * 0.09,
          Math.cos(a) * 0.09,
          s * 0.16,
        ]);
      }
    }
  const taxiMaterial = new T.MeshStandardMaterial({
    color: "#ead7a9",
    emissive: "#EAC080",
    emissiveIntensity: 0,
  });
  box(cabin, [0.62, 0.22, 0.3], [0.08, 1.94, 0], taxiMaterial, 0.06);
  const taxi = mesh(
    new T.PlaneGeometry(0.48, 0.15),
    new T.MeshBasicMaterial({ map: textTexture("TAXI", "#141e2a", "#EAC080") }),
    cabin,
    [0.08, 1.94, 0.155],
  );
  taxi.name = "TAXI";
  // Cabin: dashboard, console, instrument cluster, steering wheel and stitched seats.
  const interior = new T.Group();
  group.add(interior);
  box(interior, [0.5, 0.25, 1.55], [-0.97, 1.1, 0], dark, 0.09);
  tube(
    interior,
    [
      [-0.86, 1.23, -0.74],
      [-0.85, 1.25, 0],
      [-0.86, 1.23, 0.74],
    ],
    new T.MeshStandardMaterial({
      color: "#EAC080",
      emissive: "#EAC080",
      emissiveIntensity: 0.6,
    }),
    0.009,
  );
  box(interior, [1.25, 0.25, 0.33], [0.15, 0.62, 0], dark, 0.08);
  const steering = new T.Group();
  steering.position.set(-0.48, 1.16, 0.43);
  steering.rotation.y = Math.PI / 2;
  steering.rotation.x = 0.1;
  interior.add(steering);
  mesh(new T.TorusGeometry(0.245, 0.026, 10, 48), dark, steering);
  box(steering, [0.12, 0.1, 0.06], [0, 0, 0], paint);
  tube(
    steering,
    [
      [-0.2, 0.08, 0],
      [0, 0, 0],
      [0.2, 0.08, 0],
    ],
    chrome,
    0.016,
  );
  tube(
    steering,
    [
      [0, 0, 0],
      [0, -0.22, 0],
    ],
    chrome,
    0.016,
  );
  for (const x of [0.35, 0.9])
    for (const z of [-0.46, 0.46]) {
      box(interior, [0.5, 0.18, 0.61], [x, 0.55, z], dark, 0.1);
      const seat = box(
        interior,
        [0.18, 0.72, 0.58],
        [x + 0.26, 0.94, z],
        dark,
        0.09,
      );
      seat.rotation.z = 0.1;
      box(interior, [0.14, 0.22, 0.3], [x + 0.29, x > 0.5 ? 1.23 : 1.42, z], dark, 0.05);
      for (const dz of [-0.18, 0.18])
        tube(
          interior,
          [
            [x - 0.2, 0.65, z + dz],
            [x + 0.12, 0.65, z + dz],
            [x + 0.16, 1.24, z + dz],
          ],
          chrome,
          0.003,
        );
    }
  return { group, wheels, cabin, taxiMaterial, glass };
}
export function createPhone(t: CinematicText, rtl: boolean) {
  const group = new T.Group();
  const body = metal("#344452", 0.23);
  box(group, [0.76, 1.5, 0.085], [0, 0, 0], body, 0.08);
  box(group, [0.73, 1.46, 0.09], [0, 0, 0.012], metal("#030609"), 0.07);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  mesh(
    new T.PlaneGeometry(0.68, 1.36),
    new T.MeshBasicMaterial({ map: texture, toneMapped: false }),
    group,
    [0, 0, 0.063],
  );
  box(
    group,
    [0.2, 0.036, 0.01],
    [0, 0.65, 0.072],
    new T.MeshBasicMaterial({ color: "#020509" }),
    0.015,
  );
  box(group, [0.018, 0.15, 0.025], [0.39, 0.25, 0], body, 0.008);
  let receiptCanvas: HTMLCanvasElement | undefined;
  let last = "";
  function update(p: number) {
    const mode =
      p > 0.94
        ? "receipt"
        : p < 0.16
          ? "start"
          : p < 0.56
            ? "active"
            : p < 0.72
              ? "meter"
              : "complete";
    const fare = 12.4 + Math.min(1, Math.max(0, (p - 0.56) / 0.16)) * 12.4;
    const value = mode === "meter" ? fare.toFixed(2) : "24.80";
    const key = mode + value + (p > 0.12 && p < 0.2 ? p.toFixed(3) : "");
    if (key === last) return;
    last = key;
    ctx.fillStyle = "#0B1929";
    ctx.fillRect(0, 0, 512, 1024);
    if (mode === "receipt" && receiptCanvas) {
      ctx.drawImage(receiptCanvas, 28, 68, 456, 790);
      ctx.fillStyle = "#EAC080";
      ctx.beginPath();
      ctx.roundRect(28, 880, 456, 80, 24);
      ctx.fill();
      ctx.fillStyle = "#0B1929";
      ctx.font = "bold 26px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(t.email, 256, 931, 430);
      texture.needsUpdate = true;
      return;
    }

    ctx.textAlign = "center";
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.fillStyle = "#A6B8C9";
    ctx.font = "24px system-ui";
    ctx.fillText("09:41", 75, 47);
    ctx.font = "bold 32px system-ui";
    ctx.fillStyle = "#EAC080";
    ctx.fillText("JOUW DRIVER", 256, 130);
    ctx.fillStyle = "#F3F5F7";
    ctx.font = "28px system-ui";
    ctx.fillText(
      mode === "start"
        ? t.ready
        : mode === "active"
          ? t.active
          : mode === "meter"
            ? t.meter
            : t.complete,
      256,
      203,
      470,
    );
    ctx.strokeStyle = "#38546b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(256, 435, 156, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "#EAC080";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(
      256,
      435,
      156,
      0.75 * Math.PI,
      mode === "start" ? 1.25 * Math.PI : 2.2 * Math.PI,
    );
    ctx.stroke();
    ctx.fillStyle = "#F3F5F7";
    ctx.font = "bold 63px monospace";
    ctx.fillText(
      mode === "start" || mode === "active" ? "128 640" : "€ " + value,
      256,
      435,
    );
    ctx.font = "23px system-ui";
    ctx.fillStyle = "#A6B8C9";
    ctx.fillText(
      mode === "start" || mode === "active" ? t.odometer : t.demo,
      256,
      484,
      445,
    );
    ctx.font = "25px monospace";
    ctx.fillText("8.4 km   ·   18:00", 256, 664);
    ctx.fillStyle = "#14283D";
    ctx.fillRect(28, 717, 456, 70);
    ctx.fillStyle = "#A9D8F2";
    ctx.font = "24px system-ui";
    ctx.fillText("Bruxelles · Brussel", 256, 761);
    ctx.fillStyle = "#EAC080";
    ctx.beginPath();
    ctx.roundRect(28, 826, 456, 88, 28);
    ctx.fill();
    ctx.fillStyle = "#0B1929";
    ctx.font = "bold 28px system-ui";
    ctx.fillText(
      mode === "start"
        ? t.start
        : mode === "active"
          ? t.active
          : mode === "meter"
            ? t.end
            : t.complete,
      256,
      882,
      430,
    );
    if (p > 0.12 && p < 0.2) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(256, 870, 30 + (p - 0.12) * 600, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#A6B8C9";
    ctx.font = "19px system-ui";
    ctx.fillText(t.demo, 256, 978, 470);
    texture.needsUpdate = true;
  }
  update(0);
  return {
    group,
    update,
    setReceipt: (canvas: HTMLCanvasElement) => {
      receiptCanvas = canvas;
      last = "";
    },
  };
}
export function createPrinter(t: CinematicText, qr: HTMLCanvasElement) {
  const group = new T.Group();
  const shell = metal("#243647", 0.4, 0.55),
    black = metal("#050a10", 0.65, 0.2);
  box(group, [1.35, 0.68, 0.95], [0, 0.34, 0], shell, 0.14);
  box(group, [1.17, 0.14, 0.72], [0, 0.72, 0], black, 0.06);
  box(group, [1.05, 0.035, 0.13], [0, 0.81, 0.12], black, 0.015);
  const roller = mesh(
    new T.CylinderGeometry(0.047, 0.047, 1.04, 24),
    metal("#586775"),
    group,
    [0, 0.82, 0.12],
  );
  roller.rotation.z = Math.PI / 2;
  const indicator = new T.MeshStandardMaterial({
    color: "#EAC080",
    emissive: "#EAC080",
    emissiveIntensity: 0,
  });
  mesh(
    new T.SphereGeometry(0.026, 12, 8),
    indicator,
    group,
    [0.45, 0.8, -0.18],
  );
  const button = mesh(
    new T.CylinderGeometry(0.065, 0.065, 0.02, 20),
    black,
    group,
    [-0.43, 0.8, -0.18],
  );
  button.rotation.x = 0.05;
  for (let i = 0; i < 12; i++)
    box(
      group,
      [0.025, 0.13, 0.012],
      [-0.4 + i * 0.074, 0.4, 0.479],
      black,
      0.005,
    );
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 900;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#fffdf7";
  c.fillRect(0, 0, 512, 900);
  c.fillStyle = "#172839";
  c.textAlign = "center";
  c.font = "bold 34px system-ui";
  c.fillText("JOUW DRIVER", 256, 70);
  c.font = "22px system-ui";
  c.fillText(t.receipt, 256, 118, 470);
  c.font = "22px monospace";
  [
    "DEMO–018",
    "Bruxelles / Brussel",
    "8.4 km · 18 min",
    "------------------------",
    "TOTAL    € 24.80",
  ].forEach((s, i) => c.fillText(s, 256, 188 + i * 55));
  c.drawImage(qr, 146, 490, 220, 220);
  c.font = "19px system-ui";
  c.fillText(t.demo, 256, 768, 470);
  c.fillText(t.email, 256, 826, 460);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const paper = new T.Group();
  paper.position.set(0, 0.82, 0.12);
  group.add(paper);
  const sheet = mesh(
    new T.PlaneGeometry(0.94, 1.65, 1, 24),
    new T.MeshBasicMaterial({
      map: texture,
      side: T.DoubleSide,
      toneMapped: false,
    }),
    paper,
    [0, 0.825, 0],
  );
  sheet.rotation.x = -0.18;
  paper.scale.y = 0.001;
  const branding = mesh(
    new T.PlaneGeometry(0.74, 0.1),
    new T.MeshBasicMaterial({ map: textTexture("JOUW DRIVER") }),
    group,
    [0, 0.58, 0.48],
  );
  branding.rotation.x = -0.1;
  return { group, paper, indicator, roller, receipt: canvas };
}
