// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
camera.position.z = 4;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the players
const geometry_player1 = new THREE.PlaneGeometry(0.1, 0.5); //
const material_player1 = new THREE.MeshBasicMaterial({ color: 0x0fff00, side: THREE.DoubleSide });
const player1 = new THREE.Mesh(geometry_player1, material_player1);
scene.add(player1);

player1.position.set(-2.3, 0.2, 0);

const geometry_player2 = new THREE.PlaneGeometry(0.1, 0.5); //
const material_player2 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const player2 = new THREE.Mesh(geometry_player2, material_player2);
scene.add(player2);

player2.position.set(+2.3, -0.2, 0);
 
const geometry_ball = new THREE.CircleGeometry(0.05, 32);
const material_ball = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
const ball = new THREE.Mesh(geometry_ball, material_ball);
scene.add(ball);

ball.position.set(1, 1);
ball.velocity = new THREE.Vector3(0.02, 0.02, 0);



// Create a square (plane)
const geometry = new THREE.PlaneGeometry(5, 2.8); // 1x1 square

// Create a material
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

// Create edges geometry from the square
const edges = new THREE.EdgesGeometry(geometry);

// Create a line segments object to represent the square's edges
const line = new THREE.LineSegments(edges, material);

// Add the line to the scene
scene.add(line);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
	ball.position.add(ball.velocity);
	if (ball.position.x + ball.geometry.parameters.radius > geometry.parameters.width / 2 || 
		ball.position.x - ball.geometry.parameters.radius < -geometry.parameters.width / 2) {
		ball.velocity.x *= -1;
		}
	if (ball.position.y + ball.geometry.parameters.radius > geometry.parameters.height / 2 || 
		ball.position.y - ball.geometry.parameters.radius < -geometry.parameters.height / 2) {
		ball.velocity.y *= -1;
		}
	if (ball.position.x - ball.geometry.parameters.radius < player1.position.x + geometry_player1.parameters.width / 2 &&
		ball.position.x + ball.geometry.parameters.radius > player1.position.x - geometry_player1.parameters.width / 2 &&
		ball.position.y + ball.geometry.parameters.radius > player1.position.y - geometry_player1.parameters.height / 2 &&
		ball.position.y - ball.geometry.parameters.radius < player1.position.y + geometry_player1.parameters.height / 2) {
		ball.velocity.x *= -1;
		}
	if (ball.position.x - ball.geometry.parameters.radius < player2.position.x + geometry_player2.parameters.width / 2 &&
		ball.position.x + ball.geometry.parameters.radius > player2.position.x - geometry_player2.parameters.width / 2 &&
		ball.position.y + ball.geometry.parameters.radius > player2.position.y - geometry_player2.parameters.height / 2 &&
		ball.position.y - ball.geometry.parameters.radius < player2.position.y + geometry_player2.parameters.height / 2) {
		ball.velocity.x *= -1;
	}
  	renderer.render(scene, camera);
}

animate();

window.addEventListener('keydown', function(event) {
    if (event.key === 's') {
        player1.position.y -= 0.1;
    }
	if (event.key === 'w' )
		player1.position.y += 0.1;
	if (event.key === 'l') {
        player2.position.y -= 0.1;
    }
	if (event.key === 'o' )
		player2.position.y += 0.1;
});

window.addEventListener('unload', function() {
    document.body.removeChild(renderer.domElement);
});