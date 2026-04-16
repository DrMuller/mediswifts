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

// ── Medi face on France ──
const mediTexture = new THREE.TextureLoader().load(
  `${import.meta.env.BASE_URL}image/medi.png`,
);
mediTexture.colorSpace = THREE.SRGBColorSpace;
const mediSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: mediTexture, transparent: true }),
);
const MEDI_BASE = latLngToVec3(46.6, 2.2, GLOBE_R);
const MEDI_NORMAL = MEDI_BASE.clone().normalize();
const MEDI_ASPECT = 300 / 402;
const MEDI_H = 0.4;
const MEDI_W = MEDI_H * MEDI_ASPECT;
mediSprite.position.copy(
  MEDI_BASE.clone().addScaledVector(MEDI_NORMAL, 0.12),
);
mediSprite.scale.set(MEDI_W, MEDI_H, 1);
scene.add(mediSprite);

// ── Flocks ──
const flocks = species.map((s) => new Flock(s, scene, GLOBE_R));

// ── Raycaster (for medi click) ──
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerDown = new THREE.Vector2();
let mediAnimTime = -1;

// ── Camera animation state ──
let cameraAnim = null;
const CAM_ANIM_DURATION = 1.5;

function centerOnPosition(targetPos) {
  const startSph = new THREE.Spherical().setFromVector3(camera.position);
  const endSph = new THREE.Spherical().setFromVector3(
    targetPos.clone().normalize().multiplyScalar(startSph.radius),
  );

  let dTheta = endSph.theta - startSph.theta;
  if (dTheta > Math.PI) dTheta -= Math.PI * 2;
  if (dTheta < -Math.PI) dTheta += Math.PI * 2;

  cameraAnim = {
    startPhi: startSph.phi,
    startTheta: startSph.theta,
    dPhi: endSph.phi - startSph.phi,
    dTheta,
    dist: startSph.radius,
    progress: 0,
  };
}

function centerOnFlock(index) {
  centerOnPosition(flocks[index].posAtTime(t));
}

function centerOnMedo() {
  centerOnPosition(MEDI_BASE);
  mediAnimTime = 0;
}

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

const iconPause = document.getElementById('icon-pause');
const iconPlay = document.getElementById('icon-play');

function setPlayIcon(isPlaying) {
  iconPause.style.display = isPlaying ? '' : 'none';
  iconPlay.style.display = isPlaying ? 'none' : '';
  playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

playBtn.addEventListener('click', () => {
  playing = !playing;
  setPlayIcon(playing);
});

speedBtn.addEventListener('click', () => {
  speedIdx = (speedIdx + 1) % speeds.length;
  speedBtn.textContent = speeds[speedIdx] + 'x';
});

timelineEl.addEventListener('input', () => {
  t = parseFloat(timelineEl.value);
});

// ── Medi sprite click ──
renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDown.set(e.clientX, e.clientY);
});
renderer.domElement.addEventListener('pointerup', (e) => {
  const dx = e.clientX - pointerDown.x;
  const dy = e.clientY - pointerDown.y;
  if (dx * dx + dy * dy > 16) return;
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObject(mediSprite).length > 0) {
    mediAnimTime = 0;
  }
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
  species.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${s.hexColor};box-shadow:0 0 6px ${s.hexColor}80"></span>
      <span class="legend-name">${s.name}</span>
      <span class="legend-latin">${s.scientificName}</span>`;
    item.addEventListener('click', () => {
      el.querySelectorAll('.legend-item').forEach((li) =>
        li.classList.remove('active'),
      );
      item.classList.add('active');
      centerOnFlock(i);
    });
    el.appendChild(item);
  });

  const medo = document.createElement('div');
  medo.className = 'legend-item';
  medo.innerHTML = `
    <img class="legend-medo" src="${import.meta.env.BASE_URL}image/medi.png" alt="Medo" />
    <span class="legend-name">Medo</span>
    <span class="legend-latin">France</span>`;
  medo.addEventListener('click', () => {
    el.querySelectorAll('.legend-item').forEach((li) =>
      li.classList.remove('active'),
    );
    medo.classList.add('active');
    centerOnMedo();
  });
  el.appendChild(medo);
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

  // ── Medi face animation ──
  if (mediAnimTime >= 0) {
    mediAnimTime += dt;
    const p = Math.min(mediAnimTime / 0.8, 1);
    const bounce =
      p < 0.4
        ? Math.sin((p / 0.4) * Math.PI) * 0.6
        : Math.sin(((p - 0.4) / 0.6) * Math.PI * 2) * 0.15 * (1 - p);
    mediSprite.scale.set(
      MEDI_W * (1 + bounce),
      MEDI_H * (1 + bounce),
      1,
    );
    mediSprite.position.copy(
      MEDI_BASE.clone().addScaledVector(MEDI_NORMAL, 0.12 + bounce * 0.4),
    );
    mediSprite.material.rotation = Math.sin(p * Math.PI * 4) * 0.3 * (1 - p);
    if (p >= 1) {
      mediAnimTime = -1;
      mediSprite.scale.set(MEDI_W, MEDI_H, 1);
      mediSprite.position.copy(
        MEDI_BASE.clone().addScaledVector(MEDI_NORMAL, 0.12),
      );
      mediSprite.material.rotation = 0;
    }
  } else {
    const bob = Math.sin(elapsed * 2) * 0.02;
    mediSprite.position.copy(
      MEDI_BASE.clone().addScaledVector(MEDI_NORMAL, 0.12 + bob),
    );
  }

  // ── Camera auto-center animation ──
  if (cameraAnim) {
    cameraAnim.progress += dt / CAM_ANIM_DURATION;
    if (cameraAnim.progress >= 1) cameraAnim.progress = 1;
    const x = cameraAnim.progress;
    const ease =
      x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
    const phi = cameraAnim.startPhi + cameraAnim.dPhi * ease;
    const theta = cameraAnim.startTheta + cameraAnim.dTheta * ease;
    camera.position.setFromSpherical(
      new THREE.Spherical(cameraAnim.dist, phi, theta),
    );
    if (cameraAnim.progress >= 1) cameraAnim = null;
  }

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
