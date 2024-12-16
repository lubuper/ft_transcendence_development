/* ISSUES:
- while gameHost:
	- gameClient e gameHost nao estao a detectar os tiros um do outro.
		R: verificar os updates e sends dos projecteis.

- while gameClient:
	- gameClient nao esta a ir buscar a nave do adversario correctamente.
		R: verificar a funcao de fetchship de acordo com o jogador
	- gameClient e gameHost nao estao a detectar os tiros um do outro.
		R: verificar os updates e sends dos projecteis.
	- Asteroids do gameClient nao se dividem, em game logic desaparecem apos 1 tiro.
		R: verificar a logica das colisoes dos asteroids, os updates de sends.
	- gameClient nao tem colisoes
		R: verificar os updates e sends dos projecteis.


*/


import { saveMatchHistory } from './components/pages/Dashboard.js';
import { getOtherPlayer, getSelectedGameID, getSenderPlayer } from "./components/pages/RemotePlay.js";
import { navigate } from "./helpers/App.js";
import {findReceiver, finishInvitation, finishRank} from "./pongRemote.js";

let thisUser = null;
let gameHost = null;
let gameClient = null;
let gameAbandoned = false;
let gameFinished = false;
let isWaiting = false;
let waitingModal = document.createElement('div');
let midGame = false;
let flagFirstUser = false;

function getCSRFToken() {
	const name = 'csrftoken';
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const trimmedCookie = cookie.trim();
		if (trimmedCookie.startsWith(name + '=')) {
			return decodeURIComponent(trimmedCookie.substring(name.length + 1));
		}
	}
	return null;
}

class Level {
	constructor(number, asteroids, sAsteroids) {
		this.number = number;
		this.asteroids = asteroids;
		this.sAsteroids = sAsteroids;
	}
}

class Game {
	constructor() {
		this.levels = [
			new Level(0, 1, 0),
			new Level(1, 2, 0),
			new Level(2, 3, 1),
			new Level(3, 2, 1),
			new Level(4, 2, 2),
			new Level(5, 3, 2),
			new Level(6, 4, 2),
			new Level(7, 4, 2),
			new Level(8, 5, 3),
			new Level(9, 7, 4),
			new Level(10, 0, 0)
		];
		this.nextLevelTimer = 0;
		this.player1Lives = 5;
		this.player2;
		this.player2Lives = 5;
		this.player2VelocityX = 0;
		this.player2VelocityY = 0;
		this.player2IsActive = true;
		this.lives2 = [];
		this.ship2Number = 8;  // Player 2 ship - change here 
		this.playerHasLost = false;
		this.player1Loser;
		this.ship1Number = 7; // Player 1 ship - change here
		this.level = 0;
		this.GameIsRunning = false;
		this.env = null;
		this.scene = new THREE.Scene();
		this.loader = new THREE.TextureLoader();
		this.aspectRatio = window.innerWidth / window.innerHeight;
		this.boundaryX = 40 * this.aspectRatio;
		this.boundaryY = 40;
		const viewSize = 100;
		this.camera = new THREE.OrthographicCamera(
			this.aspectRatio * viewSize / -2, // left
			this.aspectRatio * viewSize / 2, // right
			viewSize / 2, // top
			viewSize / -2, // bottom
			-1000, // near
			1000 // far
		);
		this.listener = new THREE.AudioListener();
		this.audioLoader = new THREE.AudioLoader();
		this.camera.add(this.listener);
		this.renderer = new THREE.WebGLRenderer();
		this.asteroids = [];
		this.sAsteroids = [];
		this.projectiles1 = [];
		this.projectiles2 = [];
		this.lives1 = [];
		this.keysPressed = {};
		this.maxSpeed = 0.5;
		this.player1VelocityX = 0;
		this.player1VelocityY = 0;
		this.player1IsActive = true;
		this.player1;
		this.shotType = 1;
		this.shotType1Display;
		this.levelDisplay;
		this.lvlCompleteScreen = 0;
		this.fbxloader = new THREE.FBXLoader();
		this.explosionGroup = [];
		this.animationFrameID;
		this.animate = this.animate.bind(this);
	}
	async fetchShipAndColorRemote() {
		let otherUser = gameClient;
		if(flagFirstUser  === false) {
			otherUser = gameHost;
		}
		try {
			const response = await fetch('/api/get-ship-and-color-remote/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
				},
				body: JSON.stringify({
					'username_guest': otherUser // Send the username in the request body
				}),
			})
			if (!response.ok) {
				throw new Error('Failed to fetch ship and color');
			}
			const data = await response.json();
			thisUser = data.username;
			if (thisUser === gameHost) {
				this.ship1Number = data.ship_player_one;
				this.ship2Number = data.ship_player_two;
			} else {
				this.ship2Number = data.ship_player_one;
				this.ship1Number = data.ship_player_two;
			}
			flagFirstUser = false;
		} catch (error) {
			console.error('Error fetching ship and color:', error);
		}
	}

	init() {
		if (this.loader === null) {
			this.cleanup();
		}
		const light = new THREE.AmbientLight(0xFFFFFF);
		this.camera.position.set(0, 0, 60);
		this.camera.lookAt(this.scene.position);
		this.camera.add(this.listener);
		this.createEnvironment()
		this.createPlayer2(this.ship2Number);
		this.displayLives2();
		this.createPlayer1(this.ship1Number);
		this.displayLives1();
		this.createShotDisplay();
		this.displayLevel();
		this.spawnAsteroids(this.levels[this.level].asteroids, 'asteroid');
		this.spawnAsteroids(this.levels[this.level].sAsteroids, 'sAsteroid');
		this.scene.add(light);
		this.setupEventListeners();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		this.GameIsRunning = true;
		setTimeout(() => {
			this.animate();
		}, 1000);
	}

	cleanup() {
		if (gameFinished === false) {
			this.sendDisconnect();
		}
		if (isWaiting === true) {
			if (thisUser === gameHost) {
				document.body.removeChild(waitingModal);
			}
			if (getOtherPlayer() === null) {
				const resultRank = finishRank(getSenderPlayer(), getSelectedGameID());
				HTMLFormControlsCollection.log(resultRank);
			} else {
				const resultInv = finishInvitation(getSenderPlayer(), getOtherPlayer(), getSelectedGameID());
				console.log(resultInv);
			}
			isWaiting = false;
			flagFirstUser = false;
			return;
		}
		thisUser = null;
		gameHost = null;
		this.GameIsRunning = false;
		cancelAnimationFrame(this.animationFrameID);
		delete this.level;
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		if (this.lives1) {
			this.lives1.forEach((life) => {
				this.scene.remove(life);
				life.geometry.dispose();
				life.material.dispose();
			});
		}
			this.lives2.forEach((life) => {
				this.scene.remove(life);
				life.geometry.dispose();
				life.material.dispose();
				});
			if (this.shieldBar2) {
				this.scene.remove(this.shieldBar2);
				this.shieldBar2.geometry.dispose();
				this.shieldBar2.material.dispose();
			}
			if (this.shieldBarBox2) {
				this.scene.remove(this.shieldBarBox2);
				this.shieldBarBox2.geometry.dispose();
				this.shieldBarBox2.material.dispose();
			}
		if (this.shieldBar1) {
			this.scene.remove(this.shieldBar1);
			this.shieldBar1.geometry.dispose();
			this.shieldBar1.material.dispose();
		}
		if (this.shieldBarBox1) {
			this.scene.remove(this.shieldBarBox1);
			this.shieldBarBox1.geometry.dispose();
			this.shieldBarBox1.material.dispose();
		}
		if (this.shotType1Display) {
			this.shotType1Display.geometry.dispose();
			this.shotType1Display.material.dispose();
		}
		this.scene.traverse(object => {
			if (object.isMesh) {
			object.geometry.dispose();
			if (object.material) {
				if (Array.isArray(object.material)) {
				object.material.forEach(material => {
					material.dispose();
					// Dispose of textures
					if (material.map) material.map.dispose();
					if (material.normalMap) material.normalMap.dispose();
					if (material.specularMap) material.specularMap.dispose();
					if (material.roughnessMap) material.roughnessMap.dispose();
					if (material.metalnessMap) material.metalnessMap.dispose();
					if (material.aoMap) material.aoMap.dispose();
					if (material.emissiveMap) material.emissiveMap.dispose();
					if (material.envMap) material.envMap.dispose();
					if (material.lightMap) material.lightMap.dispose();
					if (material.bumpMap) material.bumpMap.dispose();
				});
				} else {
				object.material.dispose();
				if (object.material.map) object.material.map.dispose();
				if (object.material.normalMap) object.material.normalMap.dispose();
				if (object.material.specularMap) object.material.specularMap.dispose();
				if (object.material.roughnessMap) object.material.roughnessMap.dispose();
				if (object.material.metalnessMap) object.material.metalnessMap.dispose();
				if (object.material.aoMap) object.material.aoMap.dispose();
				if (object.material.emissiveMap) object.material.emissiveMap.dispose();
				if (object.material.envMap) object.material.envMap.dispose();
				if (object.material.lightMap) object.material.lightMap.dispose();
				if (object.material.bumpMap) object.material.bumpMap.dispose();
				}
			}
			}
		});
	
		if (document.body.contains(this.renderer.domElement)) {
		document.body.removeChild(this.renderer.domElement);
		}
	
		this.renderer.dispose();
		this.scene.clear();

		this.asteroids = [];
		this.sAsteroids = [];
		// this.AIShips = [];
		this.projectiles1 = [];
		this.projectiles2 = [];
		this.lives = [];

		delete this.audioLoader;
		delete this.loader;
		THREE.Cache.clear();
	}

	gameOver() {
		gameFinished = true;
		midGame = false;
		this.sendDisconnect();
		this.GameIsRunning = false;
		for (let i = 0; i < 1000; i++) {}
		const match = {
			result: `Loss`,
			score: `Level ${this.level}`,
			game: `Asteroids Remote`,
		};
		saveMatchHistory(match);
		this.cleanup();
		navigate('/gamelost');
	}

	gameWin() {
		gameFinished = true;
		midGame = false;
		this.sendDisconnect();
		this.GameIsRunning = false;
		let match = null;
		if (gameAbandoned === true) {
			for (let i = 0; i < 1000; i++) {}
				match = {
					result: `Win`,
					score: `Forfeit`,
					game: `Asteroids Remote`,
			};
		}
		else {
			match = {
				result: `Win`,
				score: `Level ${this.level}`,
				game: `Asteroids Remote`,
		};
		}
		saveMatchHistory(match);
		this.cleanup();
		navigate('/gamewon');
	}

	createEnvironment() {
		const envGeometry = new THREE.PlaneGeometry(this.boundaryX * 2, this.boundaryY * 2, 1, 1);
		const envMaterial = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
		this.loader.load('/static/media/assets/mway.jpg', (texture) => {
			envMaterial.map = texture;
			envMaterial.needsUpdate = true;
			this.env = new THREE.Mesh(envGeometry, envMaterial);
			this.scene.add(this.env);	
		});
		const frameGeometry = new THREE.PlaneGeometry(this.boundaryX * 2 * 1.1, this.boundaryY * 2 * 1.2, 1, 1);
		this.loader.load('/static/media/assets/frame1.png', (frameTexture) => {
			const frameMaterial = new THREE.MeshBasicMaterial({ map: frameTexture, transparent: true, opacity: 1, depthTest: true, depthWrite: false });
			const frame = new THREE.Mesh(frameGeometry, frameMaterial);
			frame.position.set(0, 0, 15);
			this.scene.add(frame);
			frame.material.needsUpdate = true;
		});
		const levelCompleteDisp = new THREE.PlaneGeometry(170, 80, 1);
		this.loader.load('/static/media/assets/levelComplete.png', (frameTexture) => {
			const localMaterial = new THREE.MeshBasicMaterial({ map: frameTexture, transparent: true, opacity: 0, depthTest: true, depthWrite: false });
			this.lvlCompleteScreen = new THREE.Mesh(levelCompleteDisp, localMaterial);
			this.lvlCompleteScreen.position.set(0, 0, 13);
			this.scene.add(this.lvlCompleteScreen);
			this.lvlCompleteScreen.material.needsUpdate = true;
		});
	}

	getShipMesh(shipNumber) {
		let shipMesh;
		switch(shipNumber) {
			case 1:
				shipMesh = '/static/media/assets/ships/ship1.fbx';
				break;
			case 2:
				shipMesh = '/static/media/assets/ships/ship2.fbx';
				break;
			case 3:
				shipMesh = '/static/media/assets/ships/ship3.fbx';
				break;
			case 4:
				shipMesh = '/static/media/assets/ships/ship4.fbx';
				break;
			case 5:
				shipMesh = '/static/media/assets/ships/ship5.fbx';
				break;
			case 6:
				shipMesh = '/static/media/assets/ships/ship6.fbx';
				break;
			case 7:
				shipMesh = '/static/media/assets/ships/ship7.fbx';
				break;
			case 8:
				shipMesh = '/static/media/assets/ships/ship8.fbx';
				break;
			case 9:
				shipMesh = '/static/media/assets/ships/ship9.fbx';
				break;
			default:
				shipMesh = '/static/media/assets/ships/tie-fighter.fbx';
				break;
		}
		return shipMesh;
	}

	getShipTex(shipNumber) {
		let shipTex;
		switch(shipNumber) {
			case 1:
				shipTex = '/static/media/assets/ships/ship1.png';
				break;
			case 2:
				shipTex = '/static/media/assets/ships/ship22.png';
				break;
			case 3:
				shipTex = '/static/media/assets/ships/ship3.png';
				break;
			case 4:
				shipTex = '/static/media/assets/ships/ship4.png';
				break;
			case 5:
				shipTex = '/static/media/assets/ships/ship5.png';
				break;
			case 6:
				shipTex = '/static/media/assets/ships/ship6.png';
				break;
			case 7:
				shipTex = '/static/media/assets/ships/ship7.png';
				break;
			case 8:
				shipTex = '/static/media/assets/ships/ship8.png';
				break;
			case 9:
				shipTex = '/static/media/assets/ships/ship9.png';
				break;
			default:
				shipTex = '/static/media/assets/metal.png';
				break;
		}
		return shipTex;
	}

	adjustShipScale(shipNumber) {
		let scaleValue;
		switch(shipNumber) {
			case 1:
				scaleValue = 0.015;
				break;
			case 2:
				scaleValue = 0.015;
				break;
			case 3:
				scaleValue = 0.018;
				break;
			case 4:
				scaleValue = 0.012;
				break;
			case 5:
				scaleValue = 0.011;
				break;
			case 6:
				scaleValue = 0.014;
				break;
			case 7:
				scaleValue = 0.018;
				break;
			case 8:
				scaleValue = 0.042;
				break;
			default:
				scaleValue = 0.011;
				break;
		}
		return (scaleValue);
	}

	createPlayer1(shipNumber) {
		let ship1Mesh = this.getShipMesh(shipNumber);
		let ship1Tex = this.getShipTex(shipNumber);
		const geometry = new THREE.BoxGeometry(3, 3, 3);
		geometry.parameters.radius = Math.sqrt(3) * 3/2;
		const material = new THREE.MeshBasicMaterial({ visible: false });
		this.player1 = new THREE.Mesh(geometry, material);
		this.player1.position.set(-20, 0, 5);
		this.player1.velocity = { x: 0, y: 0 };
		this.fbxloader.load(ship1Mesh, (ship) => {
			// Load the texture
			this.loader.load(ship1Tex, (texture) => {
				let trymesh = new THREE.MeshLambertMaterial({ 
					map: texture, // Apply the loaded texture
					visible: true 
				});
				let scaleValue = this.adjustShipScale(shipNumber);
				ship.scale.set(scaleValue, scaleValue, scaleValue);
				ship.rotation.x = -Math.PI / 2;
				ship.rotation.z = Math.PI;
				ship.visible = true;
				ship.castShadow = true;
				ship.receiveShadow = true;
				this.player1.add(ship);
				ship.traverse((child) => {
					if (child.isMesh) {
						child.material = trymesh;
					}
					if (child.isLight) {
						child.visible = false;
					}
				});
			});
		});
		this.scene.add(this.player1);
	}

	createPlayer2(shipNumber) {
		let ship2Mesh = this.getShipMesh(shipNumber);
		let ship2Tex = this.getShipTex(shipNumber);
		const geometry = new THREE.BoxGeometry(3, 3, 3);
		geometry.parameters.radius = Math.sqrt(3) * 3/2;
		const material = new THREE.MeshBasicMaterial({ visible: false });
		this.player2 = new THREE.Mesh(geometry, material);
		this.player2.position.set(20, 0, 5);
		this.player2.velocity = { x: 0, y: 0 };
		this.fbxloader.load(ship2Mesh, (ship) => {
			// Load the texture
			this.loader.load(ship2Tex, (texture) => {
				let trymesh = new THREE.MeshLambertMaterial({ 
					map: texture, // Apply the loaded texture
					visible: true 
				});
				let scaleValue = this.adjustShipScale(shipNumber);
				ship.scale.set(scaleValue, scaleValue, scaleValue);
				ship.rotation.x = -Math.PI / 2;
				ship.rotation.z = Math.PI;
				ship.visible = true;
				ship.castShadow = true;
				ship.receiveShadow = true;
				this.player2.add(ship);
				ship.traverse((child) => {
					if (child.isMesh) {
						child.material = trymesh;
					}
					if (child.isLight) {
						child.visible = false;
					}
				});
			});
		});
		this.scene.add(this.player2);
	}

	spawnAsteroid(type, position, size = 3) {
		let geometry;
		let material;
		let heightSegments;

		if (size >= 3) {
			heightSegments = 8;
		}
		else if (size == 2) {
			heightSegments = 4;
		}
		else {
			heightSegments = 3;
		}
		if (type === 'asteroid') {
			material = new THREE.MeshLambertMaterial({ map: this.loader.load('/static/media/assets/asteroid.jpg'), side: THREE.DoubleSide });
			geometry = new THREE.SphereGeometry(size, 7, heightSegments, 0, 6.283185307179586, 0, 6.283185307179586);
		}
		else if (type === 'sAsteroid') {
			geometry = new THREE.SphereGeometry(size + 0.5, 7, 8, 0, 6.28, 3.4, 6.28);
			material = new THREE.MeshLambertMaterial({ map: this.loader.load('/static/media/assets/clouds.jpg'), side: THREE.DoubleSide });
		}
		const asteroid = new THREE.Mesh(geometry, material);
		asteroid.size = size;
		if (position) {
			asteroid.position.copy(position);
		}
		else { // REMOTE: passar posicao dos asteroids criados
			const boundary = Math.floor(Math.random() * 4);
			switch (boundary) {
			case 0: // Top boundary
				asteroid.position.x = (Math.random() - 0.5) * this.boundaryX;
				asteroid.position.y = this.boundaryY;
				asteroid.position.z = 5;
				break;
			case 1: // Right boundary
				asteroid.position.x = this.boundaryX;
				asteroid.position.y = (Math.random() - 0.5) * this.boundaryY;
				asteroid.position.z = 5;
				break;
			case 2: // Bottom boundary
				asteroid.position.x = (Math.random() - 0.5) * this.boundaryX;
				asteroid.position.y = -this.boundaryY;
				asteroid.position.z = 5;
				break;
			case 3: // Left boundary
				asteroid.position.x = -this.boundaryX;
				asteroid.position.y = (Math.random() - 0.5) * this.boundaryY;
				asteroid.position.z = 5;
				break;
			}
		}
		const speed = 0.05 + Math.random() * 0.2;
		const angle = Math.random() * Math.PI * 2;
		asteroid.velocity = {
		x: Math.cos(angle) * speed,
		y: Math.sin(angle) * speed
		};
		asteroid.rotationSpeed = {
			x: Math.random() * 0.1 - 0.05,
			y: Math.random() * 0.1 - 0.05,
			z: Math.random() * 0.1 - 0.05
		};
		this.scene.add(asteroid);
		return asteroid;
	}

	spawnAsteroids(count, type) {
		for (let i = 0; i < count; i++) {
			if (type === 'asteroid') {
				this.asteroids.push(this.spawnAsteroid(type));
			} else if (type === 'sAsteroid') {
				this.sAsteroids.push(this.spawnAsteroid(type));
			}
		}
	}

	setupEventListeners() { // REMOTE: this.sendActions({
		this.actionStates = {
			projectile1: { pressed: false },
			projectile2: { pressed: false }
		};
		window.addEventListener('keydown', (event) => {
			if (event.key === ' ' && this.player1IsActive && thisUser === gameHost) {
				event.preventDefault();
				if (!this.actionStates.projectile1.pressed && this.player1IsActive) {
					this.createProjectile(this.player1, 0);
					this.playSound('/static/media/assets/sounds/laser7.mp3', 0.9);
				}
				this.actionStates.projectile1.pressed = true;
			}
			if (event.key === ' ' && this.player2IsActive && thisUser === gameClient) {
				event.preventDefault();
				if (!this.actionStates.projectile2.pressed && this.player2IsActive) {
					this.createProjectile(this.player2, 0);
					this.playSound('/static/media/assets/sounds/laser7.mp3', 0.9);
				}
				this.actionStates.projectile2.pressed = true;
			}
			this.keysPressed[event.key] = true;
		});
		window.addEventListener('keyup', (event) => {
			if (event.key === ' ' && thisUser === gameHost) {
				this.actionStates.projectile1.pressed = false;
			}
			if (event.key === ' ' && thisUser === gameClient) {
				this.actionStates.projectile2.pressed = false;
			}
			this.keysPressed[event.key] = false;
		});
	}

	playSound = (soundFilePath, volume) => {
		if (this.audioLoader) {
			const sound = new THREE.Audio(this.listener);
			this.audioLoader.load(soundFilePath, (buffer) => {
				sound.setBuffer(buffer);
				sound.setVolume(volume); // Set volume; adjust as needed
				sound.play();
				sound.source.onended = () => {
					sound.stop();
					sound.disconnect();
				};
			});
		}
	};

	createProjectile(origin, offsetAngle) {
		let proj_color = 0xff0000;
		const geometry = new THREE.SphereGeometry(0.3, 3, 3);
		const material = new THREE.MeshBasicMaterial({ color: proj_color });
		const laser = new THREE.Mesh(geometry, material);
		laser.scale.set(0.4, 1, 2);
		laser.position.x = origin.position.x;
		laser.position.y = origin.position.y;
		laser.position.z = origin.position.z;
		let playerAngle = origin.rotation.z + THREE.Math.degToRad(offsetAngle);
		laser.rotation.z = playerAngle;
		const speed = 2;
		laser.lifetime = 30;
		laser.isPlayer = true;
		laser.velocity = {
			x: Math.sin(playerAngle) * speed,
			y: -Math.cos(playerAngle) * speed
		};
		this.scene.add(laser);
		if (thisUser === gameHost) {
			this.projectiles1.push(laser);
			this.sendPlayerShoot({
				position: { x: laser.position.x, y: laser.position.y },
				velocity: { x: laser.velocity.x, y: laser.velocity.y },
				lifetime: laser.lifetime,
			});
			
		} else {
			this.projectiles2.push(laser);
			this.sendPlayerShoot({
				position: { x: laser.position.x, y: laser.position.y },
				velocity: { x: laser.velocity.x, y: laser.velocity.y },
				lifetime: laser.lifetime,
			});
		}
	}

	checkCollision(object1, object2) {
		const distance = object1.position.distanceTo(object2.position);
		return (distance < (object1.geometry.parameters.radius + object2.geometry.parameters.radius));
	}

	checkBoundaries(object) { // REMOTE: send positions
		const offset = 5; // Define an offset to move the object beyond the boundary
	
		if (object.position.x > this.boundaryX + offset) {
			object.position.x = -this.boundaryX - offset;
		} else if (object.position.x < -this.boundaryX - offset) {
			object.position.x = this.boundaryX + offset;
		}
	
		if (object.position.y > this.boundaryY + offset) {
			object.position.y = -this.boundaryY - offset;
		} else if (object.position.y < -this.boundaryY - offset) {
			object.position.y = this.boundaryY + offset;
		}
	}

	player1Death() { // REMOTE send player position and update lives
		if (this.player1IsActive) {
			this.playSound('/static/media/assets/sounds/explosion2.mp3', 2);
			this.scene.remove(this.player1);
			this.player1Lives--;
			this.sendScore();
			this.player1IsActive = false;
		}
		if (this.checkLives()) {
			if (this.player1Lives <= 0) {
				return;
			}
			setTimeout(() => {
				this.scene.add(this.player1);
				this.player1IsActive = true;
				this.playSound('/static/media/assets/sounds/shield.mp3', 0.4)
			}, 2000);
			this.player1VelocityX = 0;
			this.player1VelocityY = 0;
			this.player1.position.set(-20, 0, 5);
			this.sendPlayerMove({
				thruster: 'off',
				amount: {x: this.player1VelocityX, y: this.player1VelocityY},
			})
		}
	}

	player2Death() { // REMOTE send player position and update lives
		if (this.player2IsActive) {
			this.playSound('/static/media/assets/sounds/explosion2.mp3', 2);
			this.scene.remove(this.player2);
			this.player2Lives--;
			this.sendScore();
			this.player2IsActive = false;
		}
		if (this.checkLives()) {
			if (this.player2Lives <= 0) {
				return;
			}
			setTimeout(() => {
				this.scene.add(this.player2);
				this.player2IsActive = true;
				this.playSound('/static/media/assets/sounds/shield.mp3', 0.4)
			}, 2000);
			this.player2VelocityX = 0;
			this.player2VelocityY = 0;
			this.player2.position.set(20, 0, 5);
			this.sendPlayerMove({
				thruster: 'off',
				amount: {x: this.player1VelocityX, y: this.player1VelocityY},
			})
		}
	}

	createShotDisplay() {
		const geometry = new THREE.PlaneGeometry(0.3, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	
		this.shotType1Display = new THREE.Mesh(geometry, material);
		this.shotType1Display.scale.set(0.8, 2, 4);
		this.shotType1Display.position.set(36, this.boundaryY + 2, 16);
		this.scene.add(this.shotType1Display);
	
		this.shotType2Display = [];
		const positions = [
			{ x: 39, y: this.boundaryY + 2, z: 16 },
			{ x: 39.5, y: this.boundaryY + 2, z: 16 },
			{ x: 40, y: this.boundaryY + 2, z: 16 }
		];
		positions.forEach(pos => {
			const mesh = new THREE.Mesh(geometry, material);
			mesh.scale.set(0.8, 2, 4);
			mesh.position.set(pos.x, pos.y, pos.z);
			mesh.visible = false;
			this.scene.add(mesh);
			this.shotType2Display.push(mesh);
		});
	}

	displayLives1() {
		for (let i = 0; i < 4; i++) {
			const imageGeometry = new THREE.PlaneGeometry(7,7,7);
			this.loader.load('/static/media/assets/lives.png', (livesTex) => {
				const imageMaterial = new THREE.MeshBasicMaterial({ map: livesTex, transparent: true, opacity: 1, depthTest: true, depthWrite: false });
				const LivesImage = new THREE.Mesh(imageGeometry, imageMaterial);
				LivesImage.position.set(i * -4 - 5, -44, 16); // needs adjusting!
				this.scene.add(LivesImage);
				this.lives1.push(LivesImage);
				LivesImage.material.needsUpdate = true;
			});
		}
	}

	displayLives2() {
		for (let i = 0; i < 4; i++) {
			const imageGeometry = new THREE.PlaneGeometry(7,7,7);
			this.loader.load('/static/media/assets/lives.png', (livesTex) => {
				const imageMaterial = new THREE.MeshBasicMaterial({ map: livesTex, transparent: true, opacity: 1, depthTest: true, depthWrite: false });
				const LivesImage = new THREE.Mesh(imageGeometry, imageMaterial);
				LivesImage.position.set(i * 4 + 5, -44, 16); // needs adjusting!!
				this.scene.add(LivesImage);
				this.lives2.push(LivesImage);
				LivesImage.material.needsUpdate = true;
			});
		}
	}

	checkLives() { // REMOTE: lives check - ???
		if ((this.player1Lives <= 0 || this.player2Lives <= 0) && this.playerHasLost === false) {
			this.playerHasLost = true;
			if (this.player1Lives <= 0) {
				this.player1Loser = true;
			}
			else {
				this.player1Loser = false;
			}
		}
		if (this.player1Lives <= 0 && this.player2Lives <= 0) {
			this.gameOver();
			return 0;
		}
		if (this.lives1.length >= this.player1Lives) {
			if (this.lives1.length > 0) {
				const life1 = this.lives1.pop();
				this.scene.remove(life1);
				life1.geometry.dispose();
				life1.material.dispose();
			}
		}
		if (this.lives2.length >= this.player2Lives) {
			if (this.lives2.length > 0) {
				const life2 = this.lives2.pop();
				this.scene.remove(life2);
				life2.geometry.dispose();
				life2.material.dispose();
			}
		}
		return 1;
	}
	
	displayLevel() {
		const geometry = new THREE.PlaneGeometry(0.4, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
	
		if (this.level > 0) {
				this.levelDisplay = new THREE.Mesh(geometry, material);
				this.levelDisplay.scale.set(0.8, 2, 4);
				this.levelDisplay.position.set(this.level - this.boundaryX + 7, this.boundaryY + 2, 16);
				this.scene.add(this.levelDisplay);
		}
	}

	levelUp() { // REMOTE: major update of objects and positions
		this.clearObjects(this.asteroids);
		this.clearObjects(this.sAsteroids);
		this.clearObjects(this.projectiles1);
		this.clearObjects(this.projectiles2);
		this.level++;
		if (this.level < this.levels.length) {
			this.spawnAsteroids(this.levels[this.level].asteroids, 'asteroid');
			this.spawnAsteroids(this.levels[this.level].sAsteroids, 'sAsteroid');
			this.player1VelocityX = 0;
			this.player1VelocityY = 0;
			this.player2VelocityX = 0;
			this.player2VelocityY = 0;
			this.player1.position.set(-20, 0, 5);
			this.player2.position.set(20, 0, 5);
			if (this.lvlCompleteScreen) {
				this.lvlCompleteScreen.material.opacity = 0;
			}
			this.displayLevel();
		}
		else {
			this.gameWin();
		}
	}
	
	clearObjects(objectArray) {
		objectArray.forEach((object) => {
			this.scene.remove(object);
			if (object.geometry) object.geometry.dispose();
			if (object.material) object.material.dispose();
		});
		objectArray.length = 0; // Clear the array
	}

	checkLevelComplete() {  // REMOTE: timer between levels maybe needs to be synced
		if (this.asteroids.length === 0) {
			if (this.lvlCompleteScreen) {
				this.lvlCompleteScreen.material.opacity += 0.02;
			}
			this.nextLevelTimer++;
			if (this.nextLevelTimer === 200) {
				this.levelUp();
			}
		}
	}

	updateExplosion() { // REMOTE: explosion lifetime update, particle update - ???
		for (let i = this.explosionGroup.length - 1; i >= 0; i--) {
			const explosion = this.explosionGroup[i];
			explosion.lifetime--;
			for (let j = explosion.particles.length - 1; j >= 0; j--) {
				const particle = explosion.particles[j];
				particle.position.add(particle.velocity);

				particle.material.opacity = explosion.lifetime / 10;
				particle.material.needsUpdate = true;
				if (particle.position.x < -this.boundaryX || particle.position.x > this.boundaryX || particle.position.y < -this.boundaryY || particle.position.y > this.boundaryY) {
					this.scene.remove(particle);
					particle.geometry.dispose();
					particle.material.dispose();
					explosion.particles.splice(j, 1);
				}
			}
			if (explosion.lifetime <= 0) {
				explosion.particles.forEach(particle => {
					this.scene.remove(particle);
					particle.geometry.dispose();
					particle.material.dispose();
				});
				this.explosionGroup.splice(i, 1);
			}
		}
	}

	createExplosion(x, y, size) {
		const explosion = {
			particles: [],
			lifetime: 60 // Adjust the lifetime as needed
		};
		const numParticles = Math.floor(Math.random() * 5) + 4 + size;
		const colors = [0xffffff, 0xffff00, 0xff0000];
		for (let i = 0; i < numParticles; i++) {
			const particleSize = Math.random() * 0.2 + 0.1;
			const particleSpeed = Math.random() * 0.4 + 0.6;
			const color = colors[Math.floor(Math.random() * colors.length)];
	
			const particle = new THREE.Mesh(
				new THREE.PlaneGeometry(particleSize, particleSize),
				new THREE.MeshBasicMaterial({ color: color, transparent: true })
			);
			particle.position.set(
				x + (Math.random() - 0.5) * 0.1,
				y + (Math.random() - 0.5) * 0.1,
				5 // Fixed z position
			);
			particle.velocity = new THREE.Vector3(
				(Math.random() - 0.5) * particleSpeed,
				(Math.random() - 0.5) * particleSpeed,
				0
			);
			explosion.particles.push(particle);
			this.scene.add(particle);
		}
	
		this.explosionGroup.push(explosion);
	}

	updatePlayer2Move(moveData) {
		if (moveData.rotation === 'left') {
			this.player2.rotation.z += 0.05;
		}
		if (moveData.rotation === 'right') {
			this.player2.rotation.z -= 0.05;
		}
		if (moveData.thruster === 'on') {
			const directionX = Math.sin(this.player2.rotation.z);
			const directionY = -Math.cos(this.player2.rotation.z);
			this.player2VelocityX += directionX * 0.02;
			this.player2VelocityY += directionY * 0.02;
			const speed = Math.sqrt(this.player2VelocityX * this.player2VelocityX + this.player2VelocityY * this.player2VelocityY);
			if (speed > this.maxSpeed) {
				const normalizationFactor = this.maxSpeed / speed;
				this.player2VelocityX *= normalizationFactor;
				this.player2VelocityY *= normalizationFactor;
			}
		}
	}

	updatePlayer1Move(moveData) {
		if (moveData.rotation === 'left') {
			this.player1.rotation.z += 0.05;
		}
		if (moveData.rotation === 'right') {
			this.player1.rotation.z -= 0.05;
		}
		if (moveData.thruster === 'on') {
			const directionX = Math.sin(this.player1.rotation.z);
			const directionY = -Math.cos(this.player1.rotation.z);
			this.player1VelocityX += directionX * 0.02;
			this.player1VelocityY += directionY * 0.02;
			const speed = Math.sqrt(this.player1VelocityX * this.player1VelocityX + this.player1VelocityY * this.player1VelocityY);
			if (speed > this.maxSpeed) {
				const normalizationFactor = this.maxSpeed / speed;
				this.player1VelocityX *= normalizationFactor;
				this.player1VelocityY *= normalizationFactor;
			}
		}
	}

	updateAsteroids(asteroidsData) {
		this.asteroids.forEach(sphere => {
			sphere.position.x += asteroidsData.position.x;
			sphere.position.y += asteroidsData.position.y;
			sphere.rotation.x += asteroidsData.rotation.x;
			sphere.rotation.y += asteroidsData.rotation.y;
			sphere.rotation.z += asteroidsData.rotation.z;
			// this.checkBoundaries(sphere);
		});
	}

	updateSAsteroids(sAsteroidsData){
		this.sAsteroids.forEach(sphere => {
			sphere.position.x += sAsteroidsData.position.x;
			sphere.position.y += sAsteroidsData.position.y;
			sphere.rotation.x += sAsteroidsData.rotation.x;
			sphere.rotation.y += sAsteroidsData.rotation.y;
			sphere.rotation.z += sAsteroidsData.rotation.z;
			// this.checkBoundaries(sphere);
		});
	}

	/* updateProjectiles1 = (projectilesData) => {
		projectilesData.forEach(proj => {
			const projectile = createProjectile(this.player1.position, 0); // Recreate projectile
			projectile.lifetime = proj.lifetime;
			this.projectiles1.push(projectile); // Add to player's projectile list
			this.scene.add(projectile); // Add to the Three.js scene
		});
	}; */ //this might not work -- review the logic of re-creating the projectile.

	updateProjectiles1(projectilesData) {
		console.log("projectiles1 array updated")
		this.projectiles1.forEach((projectile, index) => {
			projectile.position.x = projectilesData[index].position.x;
			projectile.position.y = projectilesData[index].position.y;
			projectile.velocity.x = projectilesData[index].velocity.x;
			projectile.velocity.y = projectilesData[index].velocity.y;
			projectile.lifetime = projectilesData[index].lifetime;
		});
	}

	updateProjectiles2(projectilesData) {
		console.log("projectiles2 array updated")
		this.projectiles2.forEach((projectile, index) => {
			projectile.position.x = projectilesData[index].position.x;
			projectile.position.y = projectilesData[index].position.y;
			projectile.velocity.x = projectilesData[index].velocity.x;
			projectile.velocity.y = projectilesData[index].velocity.y;
			projectile.lifetime = projectilesData[index].lifetime;
		});
	}

	updateScoreOtherPlayer(scoreData) {
			this.player1Lives = scoreData.player1Lives;
			this.player2Lives = scoreData.player2Lives;
	}

	animate() {
		if (this.GameIsRunning === false) {
			cancelAnimationFrame(this.animate);
			return;
		}
		if (this.env) {
			if (this.env.position.x > this.boundaryX) {
				this.env.position.x = -this.boundaryX;
			} else if (this.env.position.x < -this.boundaryX) {
				this.env.position.x = this.boundaryX;
			}
			if (this.env.position.y > this.boundaryY) {
				this.env.position.y = -this.boundaryY;
			} else if (this.env.position.y < -this.boundaryY) {
				this.env.position.y = this.boundaryY;
			}
		}
		// PLAYER TWO
		if (this.player2IsActive && thisUser === gameClient) {
			if (this.keysPressed['a']) {
				this.player2.rotation.z += 0.05;
				this.sendPlayerMove({
					rotation: 'left',
					amount: {z: this.player2.rotation.z},
				});
			} else if (this.keysPressed['d']) {
				this.player2.rotation.z -= 0.05;
				this.sendPlayerMove({
					rotation: 'right',
					amount: {z: this.player2.rotation.z},
				});
			}
			if (this.keysPressed['w']) {
				const directionX = Math.sin(this.player2.rotation.z);
				const directionY = -Math.cos(this.player2.rotation.z);
				this.player2VelocityX += directionX * 0.02;
				this.player2VelocityY += directionY * 0.02;
				const speed = Math.sqrt(this.player2VelocityX * this.player2VelocityX + this.player2VelocityY * this.player2VelocityY);
				if (speed > this.maxSpeed) {
					const normalizationFactor = this.maxSpeed / speed;
					this.player2VelocityX *= normalizationFactor;
					this.player2VelocityY *= normalizationFactor;
				}
				this.sendPlayerMove({
					thruster: 'on',
					amount: {x: this.player2VelocityX, y: this.player2VelocityY},
				})
			}
		}
		//END OF PLAYER TWO
		if (thisUser === gameHost) {
			for (let i = this.asteroids.length - 1; i >= 0; i--) {
				const asteroid = this.asteroids[i];
				if (this.checkCollision(this.player2, asteroid)) {
					this.createExplosion(this.player2.position.x, this.player2.position.y, 2);
					this.player2Death();
					break;
				}
			}
			for (let i = this.sAsteroids.length - 1; i >= 0; i--) {
				const sAsteroid = this.sAsteroids[i];
				if (this.checkCollision(this.player2, sAsteroid)) {
					this.createExplosion(this.player2.position.x, this.player2.position.y, 3);
					this.player2Death();
					break;
				}
			}
		}
		// PLAYER ONE
		if (this.player1IsActive && thisUser === gameHost) {  // REMOTE: player1 position
			if (this.keysPressed['a']) {
				this.player1.rotation.z += 0.05;
				this.sendPlayerMove({
					rotation: 'left',
					amount: {z: this.player1.rotation.z},
				});
			} else if (this.keysPressed['d']) {
				this.player1.rotation.z -= 0.05;
				this.sendPlayerMove({
					rotation: 'right',
					amount: {z: this.player1.rotation.z},
				});
			}
			if (this.keysPressed['w']) {
				const directionX = Math.sin(this.player1.rotation.z);
				const directionY = -Math.cos(this.player1.rotation.z);
				this.player1VelocityX += directionX * 0.02;
				this.player1VelocityY += directionY * 0.02;
				const speed = Math.sqrt(this.player1VelocityX * this.player1VelocityX + this.player1VelocityY * this.player1VelocityY);
				if (speed > this.maxSpeed) {
					const normalizationFactor = this.maxSpeed / speed;
					this.player1VelocityX *= normalizationFactor;
					this.player1VelocityY *= normalizationFactor;
				}
				this.sendPlayerMove({
					thruster: 'on',
					amount: {x: this.player1VelocityX, y: this.player1VelocityY},
				})
			}
			for (let i = this.asteroids.length - 1; i >= 0; i--) {
				const asteroid = this.asteroids[i];
				if (this.checkCollision(this.player1, asteroid)) {
					this.createExplosion(this.player1.position.x, this.player1.position.y, 2);
					this.player1Death();
					break;
				}
			}
			for (let i = this.sAsteroids.length - 1; i >= 0; i--) {
				const sAsteroid = this.sAsteroids[i];
				if (this.checkCollision(this.player1, sAsteroid)) {
					this.createExplosion(this.player1.position.x, this.player1.position.y, 3);
					this.player1Death();
					break;
				}
			}
		}
		//END OF PLAYER ONE
		this.player1.position.x += this.player1VelocityX; 
		this.player1.position.y += this.player1VelocityY;
		this.checkBoundaries(this.player1);
		this.player2.position.x += this.player2VelocityX; 
		this.player2.position.y += this.player2VelocityY;
		this.checkBoundaries(this.player2);
		this.checkLevelComplete();
		this.asteroids.forEach(sphere => {
			sphere.position.x += sphere.velocity.x;
			sphere.position.y += sphere.velocity.y;
			sphere.rotation.x += sphere.rotationSpeed.x;
			sphere.rotation.y += sphere.rotationSpeed.y;
			sphere.rotation.z += sphere.rotationSpeed.z;
			if (thisUser === gameHost) {
				this.checkBoundaries(sphere);
				this.sendAsteroidsMove({
					position: {x: sphere.position.x, y: sphere.position.y},
					rotation: {x: sphere.rotation.x, y: sphere.rotation.y, z: sphere.rotation.z},
				});
			}
		});
		this.sAsteroids.forEach(sphere => {
			sphere.position.x += sphere.velocity.x;
			sphere.position.y += sphere.velocity.y;
			sphere.rotation.x += sphere.rotationSpeed.x;
			sphere.rotation.y += sphere.rotationSpeed.y;
			sphere.rotation.z += sphere.rotationSpeed.z;
			if (thisUser === gameHost) {
				this.checkBoundaries(sphere);
				this.sendSAsteroidsMove({
					position: {x: sphere.position.x, y: sphere.position.y},
					rotation: {x: sphere.rotation.x, y: sphere.rotation.y, z: sphere.rotation.z},
				});
			}
		});
		// if (thisUser === gameHost) {
		// const projectilesData = this.projectiles1.map(projectile => ({
		// 		position: { x: projectile.position.x, y: projectile.position.y },
		// 		velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
		// 		lifetime: projectile.lifetime,
		// }));
		// }
		if (this.explosionGroup.length > 0) {
			this.updateExplosion();
		}
		// projectiles code part
		if (thisUser === gameHost) {
			for (let i = this.projectiles1.length - 1; i >= 0; i--) {
				const projectile = this.projectiles1[i];
				projectile.position.x += projectile.velocity.x;
				projectile.position.y += projectile.velocity.y;
				this.checkBoundaries(projectile);
				projectile.lifetime--;
				// Asteroid checks
				for (let j = this.asteroids.length - 1; j >= 0; j--) {
					const asteroid = this.asteroids[j];
					if (this.checkCollision(projectile, asteroid)) {
						this.playSound('/static/media/assets/sounds/explosion.mp3', 2);
						this.createExplosion(asteroid.position.x, asteroid.position.y, 5);
						if (asteroid.size > 1) {
							asteroid.size -= 1;
							for (let k = 0; k < 3; k++) {
								const newAsteroid = this.spawnAsteroid('asteroid', asteroid.position, asteroid.size);
								newAsteroid.size = asteroid.size;
								this.asteroids.push(newAsteroid);
							}
						}
						this.scene.remove(asteroid);
						this.asteroids.splice(j, 1);
						this.scene.remove(projectile);
						this.projectiles1.splice(i, 1);
						break;
					}
				}// sAsteroid checks
				for (let j = this.sAsteroids.length - 1; j >= 0; j--) {
					const sAsteroid = this.sAsteroids[j];
					if (this.checkCollision(projectile, sAsteroid)) {
						this.playSound('/static/media/assets/sounds/hit.mp3', 0.3);
						sAsteroid.velocity.x += projectile.velocity.x * 0.2;
						sAsteroid.velocity.y += projectile.velocity.y * 0.2;
						this.scene.remove(projectile);
						this.projectiles1.splice(i, 1);
						break;
					}
				}
				if (projectile.lifetime <= 0) {
					this.scene.remove(projectile);
					this.projectiles1.splice(i, 1);
				}
			}
			this.projectiles1.forEach(projectile => {
				this.sendPlayerShoot({
					position: { x: projectile.position.x, y: projectile.position.y },
					velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
					lifetime: projectile.lifetime,
				});
			});
		}
		else {
			for (let i = this.projectiles2.length - 1; i >= 0; i--) {
				const projectile = this.projectiles2[i];
				projectile.position.x += projectile.velocity.x;
				projectile.position.y += projectile.velocity.y;
				this.checkBoundaries(projectile);
				projectile.lifetime--;
				// Asteroid checks
				for (let j = this.asteroids.length - 1; j >= 0; j--) {
					const asteroid = this.asteroids[j];
					if (this.checkCollision(projectile, asteroid)) {
						this.playSound('/static/media/assets/sounds/explosion.mp3', 2);
						this.createExplosion(asteroid.position.x, asteroid.position.y, 5);
						if (asteroid.size > 1) {
							asteroid.size -= 1;
							for (let k = 0; k < 3; k++) {
								const newAsteroid = this.spawnAsteroid('asteroid', asteroid.position, asteroid.size);
								newAsteroid.size = asteroid.size;
								this.asteroids.push(newAsteroid);
							}
						}
						this.scene.remove(asteroid);
						this.asteroids.splice(j, 1);
						this.scene.remove(projectile);
						this.projectiles2.splice(i, 1);
						break;
					}
				}// sAsteroid checks
				for (let j = this.sAsteroids.length - 1; j >= 0; j--) {
					const sAsteroid = this.sAsteroids[j];
					if (this.checkCollision(projectile, sAsteroid)) {
						this.playSound('/static/media/assets/sounds/hit.mp3', 0.3);
						sAsteroid.velocity.x += projectile.velocity.x * 0.2;
						sAsteroid.velocity.y += projectile.velocity.y * 0.2;
						this.scene.remove(projectile);
						this.projectiles2.splice(i, 1);
						break;
					}
				}
				if (projectile.lifetime <= 0) {
					this.scene.remove(projectile);
					this.projectiles2.splice(i, 1);
				}
			}
			this.projectiles2.forEach(projectile => {
				this.sendPlayerShoot({
					position: { x: projectile.position.x, y: projectile.position.y },
					velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
					lifetime: projectile.lifetime,
				});
			});
		}
		this.renderer.render(this.scene, this.camera);
		this.animationFrameID = requestAnimationFrame(this.animate);
	}
}

export default function AsteroidsRemote() {
	const gameId = getSelectedGameID();
	const gameWebsocket = new WebSocket(`wss://${window.location.host}/ws/asteroids/${gameId}/?purpose=join`);
	waitingModal.innerHTML = `<div class="vh-100 d-flex flex-column align-items-center justify-content-center text-white">
		<h5>Waiting for the other opponent...</h5>
		</div>`;
	const game = new Game();
	gameWebsocket.onmessage = async function (event) {
		const data = JSON.parse(event.data);

		if (data.action === 'waiting') {
			isWaiting = true;
			midGame = false;
			flagFirstUser = true;
			document.body.appendChild(waitingModal);
		} else if (data.action === 'start_game') {
			isWaiting = false;
			midGame = true;
			thisUser = null;
			gameHost = null;
			gameAbandoned = false;
			gameFinished = false;
			gameHost = getSenderPlayer();
			gameClient = getOtherPlayer();
			if (gameClient === null) {
				const result = await findReceiver(getSelectedGameID());
				gameClient = result.receiver;
			}
			game.fetchShipAndColorRemote().then(() => {
				if (thisUser === gameHost) {
					document.body.removeChild(waitingModal);
				}
				game.init();
			});
		} else if (data.action === 'player_left') {
			alert(data.message);
			gameAbandoned = true;
			game.gameWin();
		} else if (data.action === 'player_reject') {
			alert(data.message);
			navigate('/');
		} else if (data.action === 'player_move') {
			const moveData = data.move_data;
			if (data.player === thisUser) {
				return;
			} else if (data.player === gameHost) {
				game.updatePlayer1Move(moveData);
			} else if (data.player === gameClient) {
				game.updatePlayer2Move(moveData);
			}
		} else if (data.action === 'update_asteroids') {
			if (thisUser === gameHost) {
				return;
			}
			const asteroidsData = data.asteroids_state;
			game.asteroids.forEach(sphere => {
					sphere.size = asteroidsData.size;
					sphere.position.x = asteroidsData.position.x;
					sphere.position.y = asteroidsData.position.y;
					sphere.rotation.x = asteroidsData.rotation.x;
					sphere.rotation.y = asteroidsData.rotation.y;
					sphere.rotation.z = asteroidsData.rotation.z;
				}
			);
		} else if (data.action === 'update_sasteroids') {
			if (thisUser === gameHost) {
				return;
			}
			const sAsteroidsData = data.sasteroids_state;
			game.asteroids.forEach(sphere => {
					sphere.position.x = sAsteroidsData.position.x;
					sphere.position.y = sAsteroidsData.position.y;
					sphere.rotation.x = sAsteroidsData.rotation.x;
					sphere.rotation.y = sAsteroidsData.rotation.y;
					sphere.rotation.z = sAsteroidsData.rotation.z;
				}
			)
		} else if (data.action === 'update_projectiles') {
			const projectilesData = data.projectiles;
			/* if (data.player === thisUser) {
				return;
			} else */ if (data.player === gameHost) {
				game.updateProjectiles2(projectilesData);
			} else if (data.player === gameClient) {
				game.updateProjectiles1(projectilesData);
			}
		} else if (data.action === 'update_scores') {
			const scoreData = data.score;
			if (data.player === thisUser) {
				return;
			} else {
				game.updateScoreOtherPlayer(scoreData);
			}
		}
	
		game.sendPlayerMove = (moveData) => {
			gameWebsocket.send(JSON.stringify({
				action: 'player_move',
				player: thisUser,
				move_data: moveData,
			}));
		};

		game.sendPlayerShoot = (projectilesData) => {
			gameWebsocket.send(JSON.stringify({
				action: 'update_projectiles',
				player: thisUser,
				projectiles: projectilesData,
			}));
		};

		game.sendScore = (scoreData) => {
			gameWebsocket.send(JSON.stringify({
				action: 'update_scores',
				player: gameHost,
				score: scoreData,
			}));
		};

		game.sendAsteroidsMove = (moveAsteroidsData) => {
			gameWebsocket.send(JSON.stringify({
				action: 'update_asteroids',
				player: gameHost,
				asteroids_state: moveAsteroidsData,
			}));
		};
		game.sendSAsteroidsMove = (moveSAsteroidsData) => {
			gameWebsocket.send(JSON.stringify({
				action: 'update_sasteroids',
				player: gameHost,
				sasteroids_state: moveSAsteroidsData,
			}));
		};

		game.sendDisconnect = () => {
			if (gameFinished === true) {
				gameWebsocket.close();
				gameWebsocket.onclose = function () {
					console.log(`Chat socket closed for ${gameId}`);
					delete gameWebsocket[gameId];
				};
			} else {
				gameWebsocket.close(1000, "Player left the page");
				gameWebsocket.onclose = function () {
					console.log(`Chat socket closed for left ${gameId}`);
					delete gameWebsocket[gameId];
				};
			}
		}

	};
	return game;
}

export function getGameFinished() {
	return gameFinished;
}

export function getMidGame() {
	return midGame;
}
