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
ball.position.set(0, 0);
ball.velocity = new THREE.Vector3(0.02, 0.02, 0);

// Create a square (plane)
const geometry = new THREE.PlaneGeometry(5, 2.8);

// Create a material
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });

// Create edges geometry from the square
const edges = new THREE.EdgesGeometry(geometry);

// Create a line segments object to represent the square's edges
const perimeter = new THREE.LineSegments(edges, material);

// Add the line to the scene
scene.add(perimeter);

// Function to reset the ball to the center
function resetBall() {
	ball.position.set(0, 0, 0);
	ball.velocity.set(0.02, 0.02, 0); // Reset velocity if needed
}

// Initialize score variables
let scorePlayer1 = 0;
let scorePlayer2 = 0;

// Function to update the score display
function updateScoreDisplay() {
	document.getElementById('scorePlayer1').textContent = `Player 1: ${scorePlayer1}`;
	document.getElementById('scorePlayer2').textContent = `Player 2: ${scorePlayer2}`;
}

// Player movement
window.addEventListener('keydown', function(event) {
	switch (event.key) {
		case 's':
			player1.position.y -= 0.1;
			break;
		case 'w':
			player1.position.y += 0.1;
			break;
		case 'l':
			player2.position.y -= 0.1;
			break;
		case 'o':
			player2.position.y += 0.1;
			break;
}
});


let player1Ready = false;
let player2Ready = false;

document.getElementById('readyPlayer1').addEventListener('click', function() {
player1Ready = true;
checkBothPlayersReady();
});

document.getElementById('readyPlayer2').addEventListener('click', function() {
player2Ready = true;
checkBothPlayersReady();
});

function checkBothPlayersReady() {
if (player1Ready && player2Ready) {
	// Commence the game
	startGame(); // Assuming startGame() is the function that starts the game
}
}

function startGame()
{
animate();
updateScoreDisplay(); // Ensure the score is displayed when the game starts
window.addEventListener('unload', function()
{
	if (document.body.contains(renderer.domElement))
		{
			player2Ready = false;
			player1Ready = false;
			document.body.removeChild(renderer.domElement);
		}
});
}

// Start the game when the page is fully loaded



// Animation loop
function animate() {
requestAnimationFrame(animate);
ball.position.add(ball.velocity);

// Check for scoring
if (ball.position.x + ball.geometry.parameters.radius > geometry.parameters.width / 2) {
scorePlayer2++;
updateScoreDisplay();
resetBall();
} else if (ball.position.x - ball.geometry.parameters.radius < -geometry.parameters.width / 2) {
scorePlayer1++;
updateScoreDisplay();
resetBall();
}

// Ball collision with top and bottom walls
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
}
// Player 2
if (ball.position.x - ball.geometry.parameters.radius < player2.position.x + geometry_player2.parameters.width / 2 &&
	ball.position.x + ball.geometry.parameters.radius > player2.position.x - geometry_player2.parameters.width / 2 &&
	ball.position.y + ball.geometry.parameters.radius > player2.position.y - geometry_player2.parameters.height / 2 &&
	ball.position.y - ball.geometry.parameters.radius < player2.position.y + geometry_player2.parameters.height / 2) {
ball.velocity.x *= -1;
}

renderer.render(scene, camera);
}
