import * as THREE from 'three';

const EARTH_NIGHT_URL =
  'https://unpkg.com/three-globe/example/img/earth-night.jpg';

export function createGlobe(scene, radius) {
  // Fallback grid texture (shown before remote texture loads)
  const fallback = createGridTexture();

  const material = new THREE.MeshBasicMaterial({
    map: fallback,
    color: 0x999999,
  });
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    material,
  );
  scene.add(globe);

  // Load high-res night texture
  new THREE.TextureLoader().load(EARTH_NIGHT_URL, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    material.map = tex;
    material.needsUpdate = true;
  });

  // Atmosphere glow (back-face fresnel)
  const atmosGeo = new THREE.SphereGeometry(radius * 1.04, 64, 64);
  const atmosMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
        float intensity = pow(rim, 3.0) * 1.2;
        gl_FragColor = vec4(0.25, 0.5, 1.0, intensity * 0.7);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(atmosGeo, atmosMat));

  // Star field
  const starCount = 4000;
  const starPos = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const r = 60 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
    starSizes[i] = 0.05 + Math.random() * 0.2;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
  const starMat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (150.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        gl_FragColor = vec4(0.9, 0.92, 1.0, a * a);
      }`,
    transparent: true,
    depthWrite: false,
  });
  scene.add(new THREE.Points(starGeo, starMat));

  return globe;
}

function createGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#060d1a';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = 'rgba(25, 50, 100, 0.4)';
  ctx.lineWidth = 0.5;

  for (let lng = 0; lng <= 360; lng += 30) {
    const x = (lng / 360) * 1024;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 180; lat += 30) {
    const y = (lat / 180) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
