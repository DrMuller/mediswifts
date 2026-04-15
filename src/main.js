import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createGlobe } from './globe.js';
import { Flock } from './flock.js';
import { species } from './data.js';

import './style.css';

const GLOBE_R = 5;
const YEAR_SECS = 60; // seconds per full year at 1x

// ── Scene ──
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  200,
);
// Position to see Europe / Africa
camera.position.set(12, 5, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000811);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Post-processing (bloom)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.6,
  0.5,
  0.82,
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 7;
controls.maxDistance = 30;
controls.enablePan = false;

// Lighting
scene.add(new THREE.AmbientLight(0x222244, 0.8));

// ── Globe ──
createGlobe(scene, GLOBE_R);

// ── Flocks ──
const flocks = species.map((s) => new Flock(s, scene, GLOBE_R));

// ── Build UI ──
buildLegend();
buildKmRow();

// ── Timeline state ──
let t = 0; // 0..1
let playing = true;
const speeds = [1, 2, 4, 0.5];
let speedIdx = 0;

// DOM refs
const timelineEl = document.getElementById('timeline');
const dateEl = document.getElementById('date-label');
const playBtn = document.getElementById('play-btn');
const speedBtn = document.getElementById('speed-btn');

playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? '\u23F8' : '\u25B6';
});

speedBtn.addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % speeds.length;
  speedBtn.textContent = speeds[speedIdx] + 'x';
});

timelineEl.addEventListener('input', () => {
  t = parseFloat(timelineEl.value);
});

// ── Helpers ──
function tToDate(t) {
  const day = Math.floor(t * 365);
  const d = new Date(2024, 0, 1);
  d.setDate(d.getDate() + day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildLegend() {
  const el = document.getElementById('legend');
  species.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${s.hexColor};box-shadow:0 0 6px ${s.hexColor}80"></span>
      <span class="legend-name">${s.name}</span>
      <span class="legend-latin">${s.scientificName}</span>`;
    el.appendChild(item);
  });
}

function buildKmRow() {
  const row = document.getElementById('km-row');
  species.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'km-item';
    item.innerHTML = `
      <span class="km-dot" style="background:${s.hexColor}"></span>
      <span class="km-value" id="km-${s.id}">0 km</span>`;
    row.appendChild(item);
  });
}

function updateKm() {
  flocks.forEach((f, i) => {
    const el = document.getElementById(`km-${species[i].id}`);
    el.textContent = f.getKm(t).toLocaleString() + ' km';
  });
}

// ── Animation ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  if (playing) {
    t += (dt / YEAR_SECS) * speeds[speedIdx];
    if (t > 1) t -= 1;
    timelineEl.value = t;
  }

  dateEl.textContent = tToDate(t);
  updateKm();

  flocks.forEach((f) => f.update(t, elapsed));
  controls.update();
  composer.render();
}

animate();

// ── Resize ──
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});
