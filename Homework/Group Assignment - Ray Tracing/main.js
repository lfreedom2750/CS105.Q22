import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ============== SCENE SETUP ==============
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Light white background - clean studio feel
scene.background = new THREE.Color(0xfafafa);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 4, 18);
camera.lookAt(0, 2.5, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 10;
controls.maxDistance = 60;
controls.target.set(0, 2.5, 0);

// ============== SETTINGS ==============
const settings = {
  showPrimary: true,
  showShadow: true,
  showReflection: true,
  showAmbient: true,
  rayCount: 35,
  rayLength: 80,
  sunIntensity: 1.0
};

// ============== COLORS ==============
const COLORS = {
  primary: 0xffd700,
  shadowLit: 0xff8c00,
  shadowDark: 0x9b59b6,
  reflection: 0x2ecc71,
  sun: 0xffdd44
};

// ============== FLOOR ==============
const floorGeometry = new THREE.PlaneGeometry(80, 60);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xe0e0e0,
  roughness: 0.9,
  metalness: 0
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Floor grid
const gridHelper = new THREE.GridHelper(80, 40, 0xcccccc, 0xdddddd);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ============== BACK WALL ==============
const wallGeometry = new THREE.PlaneGeometry(80, 40);
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f5f5,
  roughness: 0.95,
  metalness: 0
});
const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
backWall.position.set(0, 20, -25);
backWall.receiveShadow = true;
scene.add(backWall);

// ============== LIGHT BULB ==============
const sunGroup = new THREE.Group();

// Bulb
const sunGeometry = new THREE.SphereGeometry(1.2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
  color: COLORS.sun
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunGroup.add(sunMesh);

// Glow
const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffee,
  transparent: true,
  opacity: 0.35
});
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
sunGroup.add(glowMesh);

// Position: side-left, above the scene
sunGroup.position.set(-8, 14, -4);
scene.add(sunGroup);

// Point Light
const sunLight = new THREE.PointLight(0xffffff, settings.sunIntensity * 80, 120);
sunLight.position.copy(sunGroup.position);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.3);
scene.add(hemiLight);

// ============== OBJECTS (Only 2) ==============
const objects = [];
const objectGroup = new THREE.Group();
scene.add(objectGroup);

function createMaterial(color, reflective = 0) {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5 - reflective * 0.3,
    metalness: reflective * 0.3,
    emissive: color,
    emissiveIntensity: 0.03
  });
}

function createObject(type, position, size, color, reflective = 0) {
  let geometry;
  
  switch(type) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(size, 48, 48);
      break;
    case 'box':
      geometry = new THREE.BoxGeometry(size * 1.3, size * 1.5, size * 1.3);
      break;
    default:
      geometry = new THREE.SphereGeometry(size, 32, 32);
  }

  const material = createMaterial(color, reflective);
  const mesh = new THREE.Mesh(geometry, material);
  
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  mesh.userData = {
    type: type,
    size: size,
    color: color,
    reflective: reflective
  };

  return mesh;
}

// Only 2 objects - positioned so one can cast shadow on the other
const initialObjects = [
  { type: 'sphere', pos: [-3, 3.5, -2], size: 3, color: 0x5096ff, reflective: 0.45 },
  { type: 'box', pos: [5, 3.5, -6], size: 3, color: 0xff5a5a, reflective: 0.25 }
];

function setupObjects() {
  objectGroup.clear();
  objects.length = 0;
  
  initialObjects.forEach(obj => {
    const mesh = createObject(obj.type, new THREE.Vector3(...obj.pos), obj.size, obj.color, obj.reflective);
    objectGroup.add(mesh);
    objects.push(mesh);
  });
}

setupObjects();

// ============== CAMERA MARKER ==============
const cameraMarker = new THREE.Group();

// Camera body
const cameraBodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8);
const cameraBodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const cameraBody = new THREE.Mesh(cameraBodyGeo, cameraBodyMat);
cameraBody.rotation.x = Math.PI / 2;
cameraMarker.add(cameraBody);

// Lens
const lensGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8);
const lensMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const lens = new THREE.Mesh(lensGeo, lensMat);
lens.rotation.x = Math.PI / 2;
lens.position.z = 0.6;
cameraMarker.add(lens);

cameraMarker.position.set(0, 3, 10);
scene.add(cameraMarker);

// Camera position reference
const cameraPos = new THREE.Vector3(0, 3, 10);

// ============== RAY VISUALIZATION ==============
const rayGroup = new THREE.Group();
scene.add(rayGroup);

const rayMaterialPrimary = new THREE.LineBasicMaterial({ 
  color: COLORS.primary,
  linewidth: 2
});

const rayMaterialShadow = new THREE.LineBasicMaterial({ 
  color: COLORS.shadowLit,
  linewidth: 2
});

const rayMaterialReflection = new THREE.LineBasicMaterial({ 
  color: COLORS.reflection,
  linewidth: 2
});

const rayMaterialShadowDark = new THREE.LineBasicMaterial({ 
  color: COLORS.shadowDark,
  linewidth: 2
});

function createRayLine(start, end, material) {
  const points = [start.clone(), end.clone()];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, material);
}

function findNearestHit(origin, direction) {
  const raycaster = new THREE.Raycaster(origin, direction);
  let nearest = null;
  let minDist = Infinity;

  objects.forEach(obj => {
    const intersects = raycaster.intersectObject(obj);
    
    if (intersects.length > 0 && intersects[0].distance < minDist) {
      minDist = intersects[0].distance;
      nearest = {
        point: intersects[0].point.clone(),
        normal: intersects[0].face.normal.clone(),
        object: obj,
        distance: intersects[0].distance
      };
      
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
      nearest.normal.applyMatrix3(normalMatrix).normalize();
    }
  });

  return nearest;
}

function isInShadow(point, lightPos, excludeObj) {
  const direction = lightPos.clone().sub(point).normalize();
  const distance = lightPos.clone().sub(point).length();
  
  const raycaster = new THREE.Raycaster(
    point.clone().add(direction.clone().multiplyScalar(0.1)),
    direction,
    0,
    distance - 0.2
  );

  for (const obj of objects) {
    if (obj === excludeObj) continue;
    const hits = raycaster.intersectObject(obj);
    if (hits.length > 0) {
      return true;
    }
  }
  
  return false;
}

function drawRays() {
  while (rayGroup.children.length > 0) {
    const child = rayGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    rayGroup.remove(child);
  }

  const horizontalSpread = Math.PI / 6;
  const verticalSpread = Math.PI / 10;
  const numRays = settings.rayCount;
  
  for (let i = 0; i < numRays; i++) {
    const t = i / (numRays - 1);
    const angleH = -horizontalSpread / 2 + horizontalSpread * t;
    const angleV = -verticalSpread / 2 + verticalSpread * t;
    
    const direction = new THREE.Vector3(
      Math.sin(angleH),
      Math.sin(angleV),
      -Math.cos(angleH)
    ).normalize();

    const hit = findNearestHit(cameraPos, direction);

    if (hit && settings.showPrimary) {
      // Primary ray (yellow)
      const primaryRay = createRayLine(cameraPos, hit.point, rayMaterialPrimary);
      rayGroup.add(primaryRay);

      // Hit point marker
      const hitGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(hit.point);
      rayGroup.add(hitMesh);

      // Shadow ray
      if (settings.showShadow) {
        const shadowDir = sunGroup.position.clone().sub(hit.point).normalize();
        const shadowEnd = hit.point.clone().add(shadowDir.clone().multiplyScalar(settings.rayLength));
        const inShadow = isInShadow(hit.point, sunGroup.position, hit.object);

        const shadowMat = inShadow ? rayMaterialShadowDark : rayMaterialShadow;
        const shadowRay = createRayLine(hit.point, shadowEnd, shadowMat);
        rayGroup.add(shadowRay);

        if (inShadow) {
          const shadowIndicator = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({ color: COLORS.shadowDark })
          );
          shadowIndicator.position.copy(hit.point);
          rayGroup.add(shadowIndicator);
        }
      }

      // Reflection ray
      if (settings.showReflection && hit.object.userData.reflective > 0) {
        const reflectedDir = direction.clone().reflect(hit.normal).normalize();
        const reflectionEnd = hit.point.clone().add(reflectedDir.multiplyScalar(settings.rayLength));
        
        const reflectionRay = createRayLine(hit.point, reflectionEnd, rayMaterialReflection);
        rayGroup.add(reflectionRay);

        const reflectionHit = findNearestHit(hit.point.clone().add(reflectedDir.clone().multiplyScalar(0.1)), reflectedDir);
        if (reflectionHit) {
          const refHitGeo = new THREE.SphereGeometry(0.12, 8, 8);
          const refHitMat = new THREE.MeshBasicMaterial({ color: COLORS.reflection });
          const refHitMesh = new THREE.Mesh(refHitGeo, refHitMat);
          refHitMesh.position.copy(reflectionHit.point);
          rayGroup.add(refHitMesh);
        }
      }
    } else if (settings.showPrimary) {
      const end = cameraPos.clone().add(direction.multiplyScalar(settings.rayLength));
      const missRay = createRayLine(cameraPos, end, rayMaterialPrimary);
      rayGroup.add(missRay);
    }
  }
}

// ============== DRAG LIGHT ==============
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDraggingSun = false;
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

function onMouseDown(event) {
  if (isDraggingObject) return;

  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const sunIntersects = raycaster.intersectObject(sunMesh);
  if (sunIntersects.length > 0) {
    isDraggingSun = true;
    controls.enabled = false;
    dragPlane.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, 1),
      sunGroup.position
    );
  }
}

function onMouseMove(event) {
  if (!isDraggingSun) return;

  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(dragPlane, intersectPoint);

  if (intersectPoint) {
    intersectPoint.y = Math.max(8, intersectPoint.y);
    intersectPoint.z = Math.max(-20, Math.min(-5, intersectPoint.z));
    sunGroup.position.copy(intersectPoint);
    sunLight.position.copy(intersectPoint);
    drawRays();
  }
}

function onMouseUp() {
  isDraggingSun = false;
  controls.enabled = true;
}

// ============== DRAG OBJECTS ==============
let isDraggingObject = false;
let draggedObject = null;
let objectDragPlane = new THREE.Plane();

function onObjectMouseDown(event) {
  if (isDraggingSun) return;

  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  // Check if clicking on any object
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    isDraggingObject = true;
    draggedObject = intersects[0].object;
    controls.enabled = false;
    
    // Create drag plane facing camera
    objectDragPlane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).negate(),
      draggedObject.position
    );
    
    event.stopPropagation();
  }
}

function onObjectMouseMove(event) {
  if (!isDraggingObject || !draggedObject) return;

  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(objectDragPlane, intersectPoint);

  if (intersectPoint) {
    // Update object position
    draggedObject.position.x = intersectPoint.x;
    draggedObject.position.z = intersectPoint.z;
    
    // Update in initialObjects for randomization
    const objIndex = objects.indexOf(draggedObject);
    if (objIndex >= 0) {
      initialObjects[objIndex].pos[0] = draggedObject.position.x;
      initialObjects[objIndex].pos[2] = draggedObject.position.z;
    }
    
    drawRays();
  }
}

function onObjectMouseUp() {
  isDraggingObject = false;
  draggedObject = null;
  controls.enabled = true;
}

container.addEventListener('mousedown', onObjectMouseDown);
container.addEventListener('mousemove', onObjectMouseMove);
container.addEventListener('mouseup', onObjectMouseUp);
container.addEventListener('mouseleave', onObjectMouseUp);

// ============== UI CONTROLS ==============
document.getElementById('togglePrimary').addEventListener('change', (e) => {
  settings.showPrimary = e.target.checked;
  drawRays();
});

document.getElementById('toggleShadow').addEventListener('change', (e) => {
  settings.showShadow = e.target.checked;
  drawRays();
});

document.getElementById('toggleReflection').addEventListener('change', (e) => {
  settings.showReflection = e.target.checked;
  drawRays();
});

document.getElementById('toggleAmbient').addEventListener('change', (e) => {
  settings.showAmbient = e.target.checked;
  ambientLight.visible = e.target.checked;
});

document.getElementById('rayCount').addEventListener('input', (e) => {
  settings.rayCount = parseInt(e.target.value);
  document.getElementById('rayCountValue').textContent = settings.rayCount;
  drawRays();
});

document.getElementById('rayLength').addEventListener('input', (e) => {
  settings.rayLength = parseInt(e.target.value);
  drawRays();
});

document.getElementById('sunIntensity').addEventListener('input', (e) => {
  settings.sunIntensity = parseFloat(e.target.value);
  sunLight.intensity = settings.sunIntensity * 80;
  glowMaterial.opacity = 0.25 + settings.sunIntensity * 0.15;
});

document.getElementById('objectHeight').addEventListener('input', (e) => {
  const height = parseFloat(e.target.value);
  objects.forEach((obj) => {
    obj.position.y = height + obj.userData.size;
  });
  drawRays();
});

document.getElementById('btnRandomize').addEventListener('click', () => {
  initialObjects.forEach((obj, i) => {
    obj.pos = [
      (i === 0 ? -1 : 1) * (Math.random() * 5 + 4),
      Math.random() * 3 + 3,
      -Math.random() * 5 - 4
    ];
    obj.size = Math.random() * 1.5 + 2.5;
    obj.reflective = Math.random() * 0.5;
  });
  setupObjects();
  drawRays();
});

// ============== FPS COUNTER ==============
let frameCount = 0;
let lastTime = performance.now();
const fpsDisplay = document.getElementById('fpsCounter');

function updateFPS() {
  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastTime >= 1000) {
    fpsDisplay.textContent = frameCount;
    frameCount = 0;
    lastTime = currentTime;
  }
}

// ============== ANIMATION ==============
function animate() {
  requestAnimationFrame(animate);
  
  const pulse = Math.sin(Date.now() * 0.002) * 0.08 + 1;
  glowMesh.scale.set(pulse, pulse, pulse);

  objects.forEach((obj, i) => {
    obj.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1);
  });

  controls.update();
  renderer.render(scene, camera);
  updateFPS();
}

animate();

// ============== RESIZE ==============
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

drawRays();
