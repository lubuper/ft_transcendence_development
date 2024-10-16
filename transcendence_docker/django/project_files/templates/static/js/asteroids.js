import { saveMatchHistory } from './components/pages/Dashboard.js';

class Level {
	constructor(number, asteroids, sAsteroids, AIShips, powerups) {
		this.number = number;
		this.asteroids = asteroids;
		this.sAsteroids = sAsteroids;
		this.AIShips = AIShips;
		this.powerups = powerups;
	}
}

class Game {
	constructor(gameMode) {
		this.gameMode = gameMode;
		if (this.gameMode !== '1' && this.gameMode !== '2' && this.gameMode !== '3' && this.gameMode !== '4') {
			this.cleanup();
		}
		this.levels = [
			new Level(0, 1, 0, 0, 0),
			new Level(1, 2, 0, 0, 0),
			new Level(2, 3, 1, 1, 0),
			new Level(3, 0, 1, 1, 0),
			new Level(4, 0, 0, 0, 2),
			new Level(5, 3, 2, 0, 0),
			new Level(6, 4, 2, 0, 0),
			new Level(7, 4, 2, 2, 1)
		];
		this.nextLevelTimer = 0;
		this.playerLives = 5;
		this.level = 1;
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
		this.AIShips = [];
		this.powerups = [];
		this.projectiles = [];
		this.lives = [];
		this.shield;
		this.shieldBar;
		this.shieldBarBox;
		this.keysPressed = {};
		this.maxSpeed = 0.5;
		this.playerVelocityX = 0;
		this.playerVelocityY = 0;
		this.playerIsActive = true;
		this.player;
		this.shotType = 1;
		this.shotType1Display;
		this.shotType2Display;
		this.levelDisplay;
		this.lvlCompleteScreen = 0;
		this.fbxloader = new THREE.FBXLoader();
		this.explosionGroup = [];
		this.animationFrameID;
		this.animate = this.animate.bind(this);
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
		this.createPlayer();
		this.displayLives();
		this.displayShieldBar();
		this.createShotDisplay();
		this.displayLevel();
		this.spawnAsteroids(this.levels[this.level].asteroids, 'asteroid');
		this.spawnAsteroids(this.levels[this.level].sAsteroids, 'sAsteroid');
		this.spawnAIships(this.levels[this.level].AIShips);
		//this.spawnpowerups(this.levels[this.level.powerups]);
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
		this.GameIsRunning = false;
		cancelAnimationFrame(this.animationFrameID);
		delete this.level;
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		this.lives.forEach((life) => {
			this.scene.remove(life);
		});
	
		if (this.shieldBar) {
			this.scene.remove(this.shieldBar);
			this.shieldBar.geometry.dispose();
			this.shieldBar.material.dispose();
		}
		if (this.shieldBarBox) {
			this.scene.remove(this.shieldBarBox);
			this.shieldBarBox.geometry.dispose();
			this.shieldBarBox.material.dispose();
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
		this.AIShips = [];
		this.powerups = [];
		this.projectiles = [];
		this.lives = [];

		delete this.audioLoader;
		delete this.loader;
		THREE.Cache.clear();
	}

	gameOver() {
		this.GameIsRunning = false;
		for (let i = 0; i < 1000; i++) {}
		// const timestamp = new Date();
		// const formattedTimestamp = `
		// <span style="color: blue;">Asteroids:</span>
		// <span style="color: white;">${timestamp.toISOString().split('T')[0]}</span>
		// at
		// <span style="color: grey;">${timestamp.toTimeString().split(' ')[0]}</span> `;
		// const match = {
		// 	result: '<span style="color: red;">loss</span>',
		// 	score: this.level,
		// 	timestamp: formattedTimestamp
		// };
		const match = {
			result: `loss`,
			score: this.level,
			game: `Asteroids`,
		};
		saveMatchHistory(match);
		this.cleanup();
		document.getElementById('gameOver').style.display = 'flex';
	}

	gameWin() {
		this.GameIsRunning = false;
		for (let i = 0; i < 1000; i++) {}
		// const timestamp = new Date();
		// const formattedTimestamp = `
		// <span style="color: blue;">Asteroids:</span>
		// <span style="color: white;">${timestamp.toISOString().split('T')[0]}</span>
		// at
		// <span style="color: grey;">${timestamp.toTimeString().split(' ')[0]}</span> `;
		const match = {
			result: `win`,
			score: `level ${this.level}`,
			game: `Asteroids`,
		};
		// const match = {
		// 	result: '<span style="color: green;">win</span>',
		// 	score: this.level,
		// 	timestamp: formattedTimestamp
		// };
		saveMatchHistory(match);
		this.cleanup();
		document.getElementById('gameWin').style.display = 'flex';
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

	createShields() {
		const geometry = new THREE.RingGeometry(3.1, 3.3, 20);
		const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		this.shield = new THREE.Mesh(geometry, material);
		this.shield.position.x = this.player.position.x;
		this.shield.position.y = this.player.position.y;
		this.shield.position.z = this.player.position.z;
		this.shield.lifetime = 100;
		this.shield.spawnTime = 100;
		this.player.add(this.shield);
		this.shield.visible = false;
		let colorIndex = 0;
		const colors = [0x0000ff, 0xff0000, 0x0000ff, 0xffffff, 0x0000ff];
		const cycleColor = () => {
			colorIndex = (colorIndex + 1) % colors.length;
			this.shield.material.color.setHex(colors[colorIndex]);
			setTimeout(cycleColor, 10);
		};
		cycleColor();
	}

	createPlayer() {
		const geometry = new THREE.BoxGeometry(3, 3, 3);
		geometry.parameters.radius = Math.sqrt(3) * 3/2;
		const material = new THREE.MeshBasicMaterial({ visible: false });
		this.player = new THREE.Mesh(geometry, material);
		this.player.position.set(0, 0, 5);
		this.player.velocity = { x: 0, y: 0 };
		
		this.fbxloader.load('/static/media/assets/ships/ship4.fbx', (ship) => {
			// Load the texture
			this.loader.load('/static/media/assets/ships/ship4.png', (texture) => {
				let trymesh = new THREE.MeshLambertMaterial({ 
					map: texture, // Apply the loaded texture
					visible: true 
				});
				let scaleValue = 0.012;
				ship.position.set(0, 0, 5);
				ship.scale.set(scaleValue, scaleValue, scaleValue);
				ship.rotation.x = -Math.PI / 2;
				ship.rotation.z = Math.PI;
				ship.visible = true;
				ship.castShadow = true;
				ship.receiveShadow = true;
				this.player.add(ship);
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
		this.scene.add(this.player);
		this.createShields();
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
		else {
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

	spawnAIships(count) {
		for (let n = 0; n < count; n++) {
			// Create the invisible box for collisions
			const collisionBoxGeometry = new THREE.BoxGeometry(2, 2, 2);
			collisionBoxGeometry.parameters.radius = Math.sqrt(3);
			const collisionBoxMaterial = new THREE.MeshBasicMaterial({ visible: false });
			const collisionBox = new THREE.Mesh(collisionBoxGeometry, collisionBoxMaterial);
	
			// Load the texture for the FBX model
			const texture = new THREE.TextureLoader().load('/static/media/assets/ships/ship8.png');
			const material = new THREE.MeshLambertMaterial({ map: texture });
			const loader = new THREE.FBXLoader();
			loader.load('/static/media/assets/ships/ship8.fbx', (modelAI) => {
				modelAI.scale.set(0.035, 0.035, 0.035);
				modelAI.rotation.x = -Math.PI / 2;
				modelAI.rotation.y = -Math.PI / 2;
				modelAI.rotation.z = Math.PI;
				modelAI.traverse((child) => {
					if (child.isMesh) {
						child.material = material; // Apply the texture to the model
					}
					if (child.isLight) {
						child.visible = false;
					}
				});
				collisionBox.add(modelAI);
				const speed = 0.05 + Math.random() * 0.2;
				const angle = Math.random() * Math.PI * 2;
				collisionBox.velocity = {
					x: Math.cos(angle) * speed,
					y: Math.sin(angle) * speed
				};
				collisionBox.position.set(-this.boundaryX, 0, 5);
				collisionBox.shootTimer = Math.floor(Math.random() * (200 - 60 + 1)) + 60;
				this.scene.add(collisionBox);
				this.AIShips.push(collisionBox);
			});
		}
	}

	setupEventListeners() {
		this.actionStates = {
			shield: { pressed: false },
			projectile: { pressed: false }
		};
		window.addEventListener('keydown', (event) => {
			if (event.key === ' ') {
				event.preventDefault();
				if (!this.actionStates.projectile.pressed && this.playerIsActive) {
					this.shoot(this.shotType, true);
				}
				this.actionStates.projectile.pressed = true;
			}
			if (event.key === 'e' && this.playerIsActive && this.shield.lifetime > 0) {
				event.preventDefault();
				if (!this.actionStates.shield.pressed) {
					this.playSound('/static/media/assets/sounds/shield.mp3', 0.4);
				}
				this.shield.visible = true;
				this.actionStates.shield.pressed = true;
			}
			this.keysPressed[event.key] = true;
		});
		window.addEventListener('keyup', (event) => {
			if (event.key === ' ') {
				this.actionStates.projectile.pressed = false;
			}
			if (event.key === 'e') {
				this.actionStates.shield.pressed = false;
				this.shield.visible = false;
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

	shoot(method, isPlayer) {
		if (method === 1) {
			this.createProjectile(this.player, 0, isPlayer);
			this.playSound('/static/media/assets/sounds/laser7.mp3', 0.9);
		}
		else if (method === 2) {
			this.createProjectile(this.player, -15, isPlayer); // Left 
			this.createProjectile(this.player, 0, isPlayer);
			this.createProjectile(this.player, 15, isPlayer); // Right
			this.playSound('/static/media/assets/sounds/3shot.mp3', 1);
		}
		else if (method === 3) {

		}
	}

	createProjectile(origin, offsetAngle, isPlayer) {
		let proj_color = 0xff0000;
		if (!isPlayer) {
			proj_color = 0x00ff00;
		}
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
		if (isPlayer === true) {
			laser.isPlayer = true;
			laser.velocity = {
				x: Math.sin(playerAngle) * speed,
				y: -Math.cos(playerAngle) * speed
			};
		}
		else {
			laser.isPlayer = false;
			let playerAngle = origin.rotation.z + THREE.Math.degToRad(offsetAngle + 90);
			laser.velocity = {
				x: Math.sin(playerAngle) * speed,
				y: -Math.cos(playerAngle) * speed
			};
			this.playSound('/static/media/assets/sounds/laser7.mp3', 0.9);
		}
		this.scene.add(laser);
		this.projectiles.push(laser);
	}

	checkCollision(object1, object2) {
		const distance = object1.position.distanceTo(object2.position);
		return (distance < (object1.geometry.parameters.radius + object2.geometry.parameters.radius));
	}

	checkBoundaries(object) {
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

	playerDeath() {
		this.playSound('/static/media/assets/sounds/explosion2.mp3', 2);
		this.scene.remove(this.player);
		this.playerLives--;
		if (this.checkLives()) {
			this.playerIsActive = false;
			setTimeout(() => {
				this.scene.add(this.player);
				this.playerIsActive = true;
				this.shield.visible = true;
				this.playSound('/static/media/assets/sounds/shield.mp3', 0.4)
				this.shield.spawnTime = 100;
				if (this.shield.lifetime < 40) {
					this.shield.lifetime = 80;
				}
			}, 2000);
			this.playerVelocityX = 0;
			this.playerVelocityY = 0;
			this.player.position.set(0, 0, 5);
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

	displayLives() {
		for (let i = 0; i < 4; i++) {
			const imageGeometry = new THREE.PlaneGeometry(7,7,7);
			this.loader.load('/static/media/assets/lives.png', (livesTex) => {
				const imageMaterial = new THREE.MeshBasicMaterial({ map: livesTex, transparent: true, opacity: 1, depthTest: true, depthWrite: false });
				const LivesImage = new THREE.Mesh(imageGeometry, imageMaterial);
				LivesImage.position.set(i * 5 - 7.5, -44, 16);
				this.scene.add(LivesImage);
				this.lives.push(LivesImage);
				LivesImage.material.needsUpdate = true;
			});
		}
	}

	checkLives() {
		this.lives
		if (this.playerLives <= 0) {
			this.gameOver();
			return 0;
		}
		else if (this.lives.length >= this.playerLives) {
			if (this.lives.length > 0) {
				const life = this.lives.pop();
				this.scene.remove(life);
				life.geometry.dispose();
				life.material.dispose();
			}
		}   
		return 1;
	}

	displayShieldBar() {
		const box1Geometry = new THREE.PlaneGeometry(13, 2);
		const box1Material = new THREE.MeshBasicMaterial({ color: 0x808080})
		this.shieldBarBox = new THREE.Mesh(box1Geometry, box1Material);
		this.shieldBarBox.position.set(this.boundaryX - 13, this.boundaryY + 2.5, 16);
		this.scene.add(this.shieldBarBox);
		const barGeometry = new THREE.PlaneGeometry(10, 1);
		const barMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		this.shieldBar = new THREE.Mesh(barGeometry, barMaterial);
		this.shieldBar.position.set(this.boundaryX - 13, this.boundaryY + 2.5, 17);
		this.scene.add(this.shieldBar);
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

	levelUp() {
		this.clearObjects(this.asteroids);
		this.clearObjects(this.sAsteroids);
		this.clearObjects(this.AIShips);
		this.clearObjects(this.powerups);
		this.clearObjects(this.projectiles);
		this.level++;
		this.shield.visible = false;
		this.shield.spawnTime = 100;
		this.nextLevelTimer = 0;
		if (this.level <= this.levels.length) {
			this.spawnAsteroids(this.levels[this.level].asteroids, 'asteroid');
			this.spawnAsteroids(this.levels[this.level].sAsteroids, 'sAsteroid');
			this.spawnAIships(this.levels[this.level].AIShips);
			//this.spawnpowerups(this.levels[this.level].powerups]);
			this.playerVelocityX = 0;
			this.playerVelocityY = 0;
			this.player.position.set(0, 0, 5);
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

	checkLevelComplete() {
		if (this.asteroids.length === 0 && this.AIShips.length === 0) {
			if (this.lvlCompleteScreen) {
				this.lvlCompleteScreen.material.opacity += 0.02;
			}
			this.shield.visible = true;
			this.nextLevelTimer++;
			if (this.nextLevelTimer === 200) {
				this.levelUp();
			}
		}
	}

	updateExplosion() {
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
		const numParticles = Math.floor(Math.random() * 5) + 4;
		const colors = [0xffffff, 0xffff00, 0xff0000];
		for (let i = 0; i < numParticles; i++) {
			const particleSize = Math.random() * 0.2 + 0.1;
			const particleSpeed = Math.random() * 0.4 + 0.6;
			const color = colors[Math.floor(Math.random() * colors.length)];
	
			const particle = new THREE.Mesh(
				new THREE.PlaneGeometry(particleSize, particleSize + (size / 10)),
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

	animate() {
		if (this.GameIsRunning === false) {
			cancelAnimationFrame(this.animate);
			return;
		}
		this.animationFrameID = requestAnimationFrame(this.animate);
		if (this.env) {
			if (this.env.position.x > this.boundaryX) {
				this.env.position.x = -this.boundaryX;
			}
			else if (this.env.position.x < -this.boundaryX) {
				this.env.position.x = this.boundaryX;
			}
			if (this.env.position.y > this.boundaryY) {
				this.env.position.y = -this.boundaryY;
			}
			else if (this.env.position.y < -this.boundaryY) {
				this.env.position.y = this.boundaryY;
			}
		}
		if (this.playerIsActive) {
			if (this.keysPressed['f']) {
				this.keysPressed['f'] = false;
				if (this.shotType === 1) {
					this.shotType = 2;
					this.shotType2Display.forEach(mesh => mesh.visible = true);
					this.shotType1Display.visible = false;
				}
				else if (this.shotType === 2) {
					this.shotType = 1;
					this.shotType1Display.visible = true;
					this.shotType2Display.forEach(mesh => mesh.visible = false);
				}
			}
			if (this.keysPressed['a']) {
				this.player.rotation.z += 0.05;
			}
			else if (this.keysPressed['d']) {
				this.player.rotation.z -= 0.05;
			}
			if (this.keysPressed['w']) {
				const directionX = Math.sin(this.player.rotation.z);
				const directionY = -Math.cos(this.player.rotation.z);
				this.playerVelocityX += directionX * 0.02;
				this.playerVelocityY += directionY * 0.02;
				const speed = Math.sqrt(this.playerVelocityX * this.playerVelocityX + this.playerVelocityY * this.playerVelocityY);
				if (speed > this.maxSpeed) {
					const normalizationFactor = this.maxSpeed / speed;
					this.playerVelocityX *= normalizationFactor;
					this.playerVelocityY *= normalizationFactor;
				}
			}
			if (this.keysPressed['e'] && this.shield.lifetime > 0) {
				this.shield.lifetime--;
			}
			else if (this.shield.lifetime === 0) {
				this.shield.visible = false;
			}
			if (this.AIShips) {
				this.AIShips.forEach(ship => {
					if (ship.shootTimer > 0) {
						ship.shootTimer--;
					}
					if (ship.shootTimer === 0) {
						this.createProjectile(ship, 0, 0);
						ship.shootTimer = Math.floor(Math.random() * (200 - 60 + 1)) + 60;
					}
				});
			}
		}
		this.checkLevelComplete();
		if (this.shield.spawnTime > 0) {
			this.shield.spawnTime--;
			if (this.shield.spawnTime === 0) {
				this.shield.visible = false;
			}
		}
		if (this.shieldBar) {
			this.shieldBar.scale.x = this.shield.lifetime / 80;
		}
		this.player.position.x += this.playerVelocityX;
		this.player.position.y += this.playerVelocityY;
		this.checkBoundaries(this.player);
		this.AIShips.forEach(collisionBox => {
			collisionBox.position.x += collisionBox.velocity.x;
			collisionBox.position.y += collisionBox.velocity.y;
			const playerPosition = new THREE.Vector3(this.player.position.x, this.player.position.y, this.player.position.z);
			const direction = new THREE.Vector3().subVectors(playerPosition, collisionBox.position).normalize();
			const angleToPlayer = Math.atan2(direction.y, direction.x);
			collisionBox.rotation.z = angleToPlayer;
			this.checkBoundaries(collisionBox);
		});
		this.asteroids.forEach(sphere => {
			sphere.position.x += sphere.velocity.x;
			sphere.position.y += sphere.velocity.y;
			sphere.rotation.x += sphere.rotationSpeed.x;
			sphere.rotation.y += sphere.rotationSpeed.y;
			sphere.rotation.z += sphere.rotationSpeed.z;
			this.checkBoundaries(sphere);
		});
		this.sAsteroids.forEach(sphere => {
			sphere.position.x += sphere.velocity.x;
			sphere.position.y += sphere.velocity.y;
			sphere.rotation.x += sphere.rotationSpeed.x;
			sphere.rotation.y += sphere.rotationSpeed.y;
			sphere.rotation.z += sphere.rotationSpeed.z;
			this.checkBoundaries(sphere);
		});
		if (this.explosionGroup.length > 0)
			this.updateExplosion();
		// projectilewise code
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const projectile = this.projectiles[i];
			projectile.position.x += projectile.velocity.x;
			projectile.position.y += projectile.velocity.y;
			this.checkBoundaries(projectile);
			projectile.lifetime--;
			// Asteroid checks
			for (let j = this.asteroids.length - 1; j >= 0; j--) {
				const asteroid = this.asteroids[j];
				if (this.checkCollision(projectile, asteroid)) {
					this.playSound('/static/media/assets/sounds/explosion.mp3', 2);
					this.createExplosion(asteroid.position.x, asteroid.position.y, 0);
					if (asteroid.size > 1) {
						asteroid.size -= 1;
						for (let k = 0; k < 3; k++) {
							const newAsteroid = this.spawnAsteroid('asteroid', asteroid.position, asteroid.size);
							newAsteroid.size = asteroid.size; // Set the size of the new asteroids
							this.asteroids.push(newAsteroid);
						}
					}
					this.scene.remove(asteroid);
					this.asteroids.splice(j, 1);
					this.scene.remove(projectile);
					this.projectiles.splice(i, 1);
					break;
				}
			}
			for (let j = this.sAsteroids.length - 1; j >= 0; j--) {
				const sAsteroid = this.sAsteroids[j];
				if (this.checkCollision(projectile, sAsteroid)) {
					this.playSound('/static/media/assets/sounds/hit.mp3', 0.3);
					sAsteroid.velocity.x += projectile.velocity.x * 0.2;
					sAsteroid.velocity.y += projectile.velocity.y * 0.2;
					this.scene.remove(projectile);
					this.projectiles.splice(i, 1);
					break;
				}
			}
			// AI checks
			if (projectile.isPlayer === true) {
				for (let j = this.AIShips.length - 1; j >= 0; j--) {
					const AIShip = this.AIShips[j];
					if (this.checkCollision(projectile, AIShip)) {
						this.playSound('/static/media/assets/sounds/explosion.mp3', 2);
						this.scene.remove(AIShip);
						this.AIShips.splice(j, 1);
						this.scene.remove(projectile);
						this.projectiles.splice(i, 1);
						break;
					}
				}
			}
			else {
				if (this.checkCollision(projectile, this.player) && !this.shield.visible) {
					this.playerDeath();
					this.scene.remove(projectile);
					this.projectiles.splice(i, 1);
				}
				else if (this.checkCollision(projectile, this.player) && this.shield.visible) {
					this.scene.remove(projectile);
					this.projectiles.splice(i, 1);
				}
			}
			if (projectile.lifetime <= 0) {
				this.scene.remove(projectile);
				this.projectiles.splice(i, 1);
			}
		}
		if (!this.shield.visible && this.playerIsActive)
		{
			for (let i = this.asteroids.length - 1; i >= 0; i--) {
				const asteroid = this.asteroids[i];
				if (this.checkCollision(this.player, asteroid)) {
					this.createExplosion(this.player.position.x, this.player.position.y, 2);
					this.playerDeath();
					break;
				}
			}
			for (let i = this.sAsteroids.length - 1; i >= 0; i--) {
				const sAsteroid = this.sAsteroids[i];
				if (this.checkCollision(this.player, sAsteroid)) {
					this.createExplosion(this.player.position.x, this.player.position.y, 3);
					this.playerDeath();
					break;
				}
			}
		}
		this.renderer.render(this.scene, this.camera);
	}
}

export default function Asteroids(gameMode) {
	const game = new Game(gameMode);
	game.init();
	return game;
}