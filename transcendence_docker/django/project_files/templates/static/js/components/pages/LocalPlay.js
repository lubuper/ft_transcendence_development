let selectedGameMode = null;
let selectedGameType = null;

export default function LocalPlay(navigate) {
	const $games = document.createElement('div');
	$games.innerHTML = `
		<div class="vh-100 d-flex align-items-center justify-content-center position-relative">
			<div class="d-flex flex-column align-items-center">
				<div class="card mb-3 bg-dark text-white" style="width: 18rem; border: 1px solid #343a40; opacity: 0.8;">
					<div class="card-body">
						<h5 class="card-title text-center">Select Game Mode</h5>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="gameMode" id="pvp" value="1" checked>
							<label class="form-check-label" for="pvp">Player vs Player</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="gameMode" id="ai" value="2">
							<label class="form-check-label" for="ai">Play vs AI</label>
						</div>
						<div id="difficultyOptions" class="mt-3" style="display: none;">
							<h6 class="text-center">Select Difficulty</h6>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="ai-easy" value="2">
								<label class="form-check-label" for="ai-easy">Easy</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="ai-medium" value="3">
								<label class="form-check-label" for="ai-medium">Medium</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="ai-hard" value="4">
								<label class="form-check-label" for="ai-hard">Hard</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="ai-impossible" value="5">
								<label class="form-check-label" for="ai-impossible">Impossible</label>
							</div>
						</div>
						<h5 class="card-title text-center mt-3">Select Game Type</h5>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="gameType" id="default" value="default" checked>
							<label class="form-check-label" for="default">Default</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" name="gameType" id="powered-up" value="powered">
							<label class="form-check-label" for="powered-up">Powered Up</label>
						</div>
					</div>
				</div>
				<div class="d-flex justify-content-center mt-4">
					<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/pong">Pong</button>
					<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/asteroids">Asteroids</button>
				</div>
			</div>
			
			<div class="position-absolute top-50 translate-middle-y" style="left: 15%;">
				<div class="card bg-dark text-white" style="width: 18rem; border: 1px solid #343a40; opacity: 0.8;">
					<div class="card-body">
						<h5 class="card-title text-center">How To Play</h5>
						<p class="card-text">
							Player 1: A and D<br>
							Player 2: J and L
						</p>
					</div>
				</div>
				<img src="/static/media/assets/pongsplash.png" alt="Pong Game" class="img-fluid mt-2" style="width: 300px; height: auto;">
			</div>
			
			<div class="position-absolute top-50 translate-middle-y" style="right: 15%;">
				<div class="card bg-dark text-white" style="width: 18rem; border: 1px solid #343a40; opacity: 0.8;">
					<div class="card-body">
						<h5 class="card-title text-center">How To Play</h5>
						<p class="card-text">
							Rotate left: A<br>
							Rotate right: D<br>
							Fire: Space<br>
							Shields: E
						</p>
					</div>
				</div>
				<img src="/static/media/assets/asteroidssplash.png" alt="Asteroids Game" class="img-fluid mt-2" style="width: 300px; height: auto;">
			</div>
		</div>
	`;

	// Event listener to show/hide difficulty options
	$games.addEventListener('change', (event) => {
		if (event.target.name === 'gameMode') {
			const difficultyOptions = document.getElementById('difficultyOptions');
			const selectedValue = document.querySelector('input[name="gameMode"]:checked').value;
			if (selectedValue === '2') {
				difficultyOptions.style.display = 'block';
			} else if (selectedValue === '1') {
				difficultyOptions.style.display = 'none';
			}
		}
	});

	$games.addEventListener('click', (event) => {
		if (event.target.matches('[data-path]')) {
			event.preventDefault();
			const path = event.target.getAttribute('data-path');
			selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
			selectedGameType = document.querySelector('input[name="gameType"]:checked').value;
			navigate(path);
		}
	});

	return $games;
}

export function getSelectedGameMode() {
	return selectedGameMode;
}

export function getSelectedGameType() {
    return selectedGameType;
}