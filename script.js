let scene, camera, renderer, controls;
const cubies = [];
const step = 1.05; // Spacing between cubies

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  createCube();
  window.addEventListener('keydown', handleKeyDown);
  animate();
}

function createCube() {
  // Standard Rubik's Colors: Right, Left, Top, Bottom, Front, Back
  const colors = [0xffffff, 0xffff00, 0xff0000, 0xffa500, 0x00ff00, 0x0000ff];
  const materials = colors.map(c => new THREE.MeshLambertMaterial({ color: c }));

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue; // Skip the core

        const geom = new THREE.BoxGeometry(0.95, 0.95, 0.95);
        const cubie = new THREE.Mesh(geom, materials);
        cubie.position.set(x * step, y * step, z * step);
        
        // Add a black border effect
        const edges = new THREE.EdgesGeometry(geom);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        cubie.add(line);

        scene.add(cubie);
        cubies.push(cubie);
      }
    }
  }
}

function rotateLayer(axis, layerValue) {
  const group = new THREE.Group();
  scene.add(group);

  // Find cubies on the specific slice
  const targets = cubies.filter(c => Math.round(c.position[axis] / step) === layerValue);
  
  targets.forEach(c => group.attach(c));

  gsap.to(group.rotation, {
    [axis]: group.rotation[axis] + Math.PI / 2,
    duration: 0.4,
    onComplete: () => {
      targets.forEach(c => {
        scene.attach(c);
        // Clean up floating point errors for the next turn
        c.position.set(
          Math.round(c.position.x / step) * step,
          Math.round(c.position.y / step) * step,
          Math.round(c.position.z / step) * step
        );
      });
      scene.remove(group);
    }
  });
}

function handleKeyDown(e) {
  const key = e.key.toUpperCase();
  // Map keys to axes and layers: (axis, value)
  // Value 1 = Top/Right/Front, Value -1 = Bottom/Left/Back
  switch(key) {
    case 'U': rotateLayer('y', 1); break;
    case 'D': rotateLayer('y', -1); break;
    case 'R': rotateLayer('x', 1); break;
    case 'L': rotateLayer('x', -1); break;
    case 'F': rotateLayer('z', 1); break;
    case 'B': rotateLayer('z', -1); break;
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
