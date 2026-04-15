import * as THREE from 'three';
import { haversineKm } from './data.js';

const DEG = Math.PI / 180;

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Catmull-Rom scalar interpolation
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    ((-p0 + 3 * p1 - 3 * p2 + p3) * t3 +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + p2) * t +
      2 * p1)
  );
}

export class Flock {
  constructor(speciesData, scene, globeRadius) {
    this.species = speciesData;
    this.radius = globeRadius;
    this.wp = speciesData.waypoints;

    // Precompute cumulative km
    this.cumKm = [0];
    for (let i = 1; i < this.wp.length; i++) {
      const a = this.wp[i - 1];
      const b = this.wp[i];
      this.cumKm.push(this.cumKm[i - 1] + haversineKm(a.lat, a.lng, b.lat, b.lng));
    }
    this.totalKm = this.cumKm[this.cumKm.length - 1];

    // Per-bird random offsets
    const headCount = speciesData.particleCount;
    const trailCount = Math.floor(headCount * 3);
    this.headCount = headCount;
    this.trailCount = trailCount;
    this.total = headCount + trailCount;

    this.offsets = Array.from({ length: headCount }, () => ({
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      dz: (Math.random() - 0.5) * 2,
      phase: Math.random() * Math.PI * 2,
      freq: 0.6 + Math.random() * 1.4,
    }));

    // Particle buffers
    const positions = new Float32Array(this.total * 3);
    const alphas = new Float32Array(this.total);
    const sizes = new Float32Array(this.total);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const [r, g, b] = speciesData.color;
    const mat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(r, g, b) } },
      vertexShader: `
        attribute float alpha;
        attribute float size;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (250.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(color, glow * glow * vAlpha);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geo, mat);
    scene.add(this.points);

    // Route line
    this.buildRouteLine(scene);
  }

  buildRouteLine(scene) {
    const pts = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      pts.push(this.posAtTime(i / steps));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const [r, g, b] = this.species.color;
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.12,
    });
    scene.add(new THREE.Line(geo, mat));
  }

  // Find waypoint segment index for time t
  segmentAt(t) {
    let i = 0;
    while (i < this.wp.length - 2 && this.wp[i + 1].t < t) i++;
    return i;
  }

  // Catmull-Rom interpolation through waypoints (lat/lng)
  latLngAtTime(t) {
    const wp = this.wp;
    const i = this.segmentAt(t);
    const span = wp[i + 1].t - wp[i].t;
    const localT = span > 0 ? (t - wp[i].t) / span : 0;

    const i0 = Math.max(0, i - 1);
    const i3 = Math.min(wp.length - 1, i + 2);

    return {
      lat: catmullRom(wp[i0].lat, wp[i].lat, wp[i + 1].lat, wp[i3].lat, localT),
      lng: catmullRom(wp[i0].lng, wp[i].lng, wp[i + 1].lng, wp[i3].lng, localT),
    };
  }

  posAtTime(t) {
    const { lat, lng } = this.latLngAtTime(Math.max(0, Math.min(t, 1)));
    return latLngToVec3(lat, lng, this.radius);
  }

  getKm(t) {
    const wp = this.wp;
    const i = this.segmentAt(t);
    const span = wp[i + 1].t - wp[i].t;
    const frac = span > 0 ? (t - wp[i].t) / span : 0;
    const segLen = this.cumKm[i + 1] - this.cumKm[i];
    return Math.round(this.cumKm[i] + segLen * frac);
  }

  update(t, elapsed) {
    const pos = this.points.geometry.attributes.position.array;
    const alp = this.points.geometry.attributes.alpha.array;
    const siz = this.points.geometry.attributes.size.array;

    const center = this.posAtTime(t);

    // Direction of travel for elongation
    const ahead = this.posAtTime(Math.min(t + 0.004, 1));
    const dir = new THREE.Vector3().subVectors(ahead, center);
    const speed = dir.length();
    dir.normalize();
    const up = center.clone().normalize();
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();

    // Spread scales with speed (compact when stationary)
    const baseSpread = 0.06;
    const speedSpread = Math.min(speed * 3, 0.14);
    const spread = baseSpread + speedSpread;
    const elongation = 1.6;

    // Head particles
    for (let i = 0; i < this.headCount; i++) {
      const o = this.offsets[i];
      const w1 = Math.sin(elapsed * o.freq + o.phase) * 0.35;
      const w2 = Math.cos(elapsed * o.freq * 0.7 + o.phase * 1.3) * 0.35;

      const p = center
        .clone()
        .addScaledVector(dir, o.dx * spread * elongation + o.dx * spread * w1)
        .addScaledVector(up, o.dy * spread * 0.5 + o.dy * spread * 0.2 * w2)
        .addScaledVector(side, o.dz * spread * 0.7 + o.dz * spread * 0.2 * w1);

      p.normalize().multiplyScalar(this.radius + 0.06);

      const idx = i * 3;
      pos[idx] = p.x;
      pos[idx + 1] = p.y;
      pos[idx + 2] = p.z;
      alp[i] = 0.85;
      siz[i] = i === 0 ? 0.18 : 0.08 + Math.random() * 0.03;
    }

    // Trail particles (spread along recent path)
    for (let j = 0; j < this.trailCount; j++) {
      const frac = (j + 1) / this.trailCount;
      const trailT = t - frac * 0.025;
      const idx3 = (this.headCount + j) * 3;
      const idx1 = this.headCount + j;

      if (trailT < 0) {
        pos[idx3] = pos[idx3 + 1] = pos[idx3 + 2] = 0;
        alp[idx1] = 0;
        siz[idx1] = 0;
        continue;
      }

      const tp = this.posAtTime(trailT);
      tp.normalize().multiplyScalar(this.radius + 0.04);

      pos[idx3] = tp.x;
      pos[idx3 + 1] = tp.y;
      pos[idx3 + 2] = tp.z;

      const falloff = 1 - frac;
      alp[idx1] = falloff * falloff * 0.45;
      siz[idx1] = 0.08 * falloff;
    }

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.alpha.needsUpdate = true;
    this.points.geometry.attributes.size.needsUpdate = true;
  }
}
