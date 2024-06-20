// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
camera.position.z = 4;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a square (plane)
const geometry = new THREE.PlaneGeometry(4, 3); // 1x1 square
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const square = new THREE.Mesh(geometry, material);
scene.add(square);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  

  renderer.render(scene, camera);
}

animate();