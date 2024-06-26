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
const geometry_player1 = new THREE.PlaneGeometry(0.1, 0.5);
const material_player1 = new THREE.MeshBasicMaterial({ color: 0x0fff00, side: THREE.DoubleSide });
const player1 = new THREE.Mesh(geometry_player1, material_player1);
scene.add(player1);
player1.position.set(-2.3, 0.2, 0);

const geometry_player2 = new THREE.PlaneGeometry(0.1, 0.5);
const material_player2 = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const player2 = new THREE.Mesh(geometry_player2, material_player2);
scene.add(player2);
player2.position.set(+2.3, -0.2, 0);

// Create the ball
const geometry_ball = new THREE.CircleGeometry(0.05, 32);
const material_ball = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
const ball = new THREE.Mesh(geometry_ball, material_ball);
scene.add(ball);
ball.position.set(0, 0, 0);
ball.velocity = new THREE.Vector3(0.02, 0.02, 0);

// Create the box (plane)
const geometry = new THREE.PlaneGeometry(5, 2.8);
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const edges = new THREE.EdgesGeometry(geometry);
const box = new THREE.LineSegments(edges, material);
scene.add(box);


function resetBall() {
	ball.position.set(0, 0, 0);
	ball.velocity.set(0.04, 0.04, 0); // Reset velocity if needed
}

let scorePlayer1 = 0;
let scorePlayer2 = 0;

function updateScoreDisplay() {
	document.getElementById('scorePlayer1').textContent = `Player 1: ${scorePlayer1}`;
	document.getElementById('scorePlayer2').textContent = `Player 2: ${scorePlayer2}`;
}

let init = 1;

document.getElementById('readyPlayer1').addEventListener('click', function() {
	startGame();
});


//monitor keys to player movement
const keysPressed = {};

window.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
});

window.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
});


function startGame() {
	if (init == 1)
	{
		animate();
		updateScoreDisplay();
		init = 0;
	}
}

const maxY = geometry.parameters.height / 2 - geometry_player1.parameters.height / 2;
const minY = -geometry.parameters.height / 2 + geometry_player1.parameters.height / 2;

function beginnerAI() {
	if (ball.position.y > player2.position.y && player2.position.y <= maxY)
		player2.position.y += 0.03;
	if (ball.position.y < player2.position.y && player2.position.y >= minY)
		player2.position.y -= 0.03;
}

function animate() {
	requestAnimationFrame(animate);
	if (keysPressed['s'] && player1.position.y >= minY) {
		player1.position.y -= 0.03;
	}
	if (keysPressed['w'] && player1.position.y <= maxY) {
		player1.position.y += 0.03;
	}
	beginnerAI();
	ball.position.add(ball.velocity);
	// Check for scoring
	if (ball.position.x + ball.geometry.parameters.radius > geometry.parameters.width / 2) {
		scorePlayer1++;
		updateScoreDisplay();
		resetBall();
	}
	else if (ball.position.x - ball.geometry.parameters.radius < -geometry.parameters.width / 2) {
		scorePlayer2++;
		updateScoreDisplay();
		resetBall();
	}
	// Ball collision with walls
	if (ball.position.y + ball.geometry.parameters.radius > geometry.parameters.height / 2 || 
		ball.position.y - ball.geometry.parameters.radius < -geometry.parameters.height / 2) {
		ball.velocity.y *= -1;
	}
	// Ball collision with players
	// Player 1
	if (ball.position.x - ball.geometry.parameters.radius < player1.position.x + geometry_player1.parameters.width / 2 &&
		ball.position.x + ball.geometry.parameters.radius > player1.position.x - geometry_player1.parameters.width / 2 &&
		ball.position.y + ball.geometry.parameters.radius > player1.position.y - geometry_player1.parameters.height / 2 &&
		ball.position.y - ball.geometry.parameters.radius < player1.position.y + geometry_player1.parameters.height / 2) {
		ball.velocity.x *= -1;
		let diff = ball.position.y - player1.position.y;
		ball.velocity.y += diff * 0.1;
	}
	// Player 2
	if (ball.position.x - ball.geometry.parameters.radius < player2.position.x + geometry_player2.parameters.width / 2 &&
		ball.position.x + ball.geometry.parameters.radius > player2.position.x - geometry_player2.parameters.width / 2 &&
		ball.position.y + ball.geometry.parameters.radius > player2.position.y - geometry_player2.parameters.height / 2 &&
		ball.position.y - ball.geometry.parameters.radius < player2.position.y + geometry_player2.parameters.height / 2) {
		ball.velocity.x *= -1;
		let diff = ball.position.y - player2.position.y;
		ball.velocity.y += diff * 0.1;
	}
	renderer.render(scene, camera);
}

function cleanupGame() {
	if (document.body.contains(renderer.domElement)) {
		document.body.removeChild(renderer.domElement);
	}
	init = 1;
}