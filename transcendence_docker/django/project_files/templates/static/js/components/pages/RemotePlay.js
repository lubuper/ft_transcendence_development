let selectedGameMode = null;
let selectedGameType = null;
let tournamentPlayers = null;
let playerNames = [];

export default function RemotePlay(navigate) {
	const $games = document.createElement('div');
	$games.innerHTML = `
		<div class="container vh-100 d-flex flex-column align-items-center justify-content-start pt-3">
			<!-- Top Row for Game Mode and Game Type Cards -->
			<div class="row w-100 mb-3">
				<!-- Select Game Mode Card -->
				<div class="col-md-6 d-flex align-items-stretch">
					<div class="card bg-dark text-white w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body">
							<h5 class="card-title text-center">Select Game</h5>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="pvp" value="1" checked>
								<label class="form-check-label" for="pvp">Pong</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameMode" id="ai" value="2">
								<label class="form-check-label" for="ai">Asteroids</label>
							</div>
							</div>
						</div>
					</div>
					<div class="col-md-6 d-flex align-items-stretch">
					<div class="card bg-dark text-white w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body">
							<h5 class="card-title text-center">Invitations</h5>
								<div class="card-body">
									<p>You currently have no invitations.</p>
								</div>
						</div>
					</div>
					</div>
				</div>
			<!-- Tournament Setup Section -->
			<div class="row w-100 mb-3">
				<div class="col-md-12">
					<div class="card bg-dark text-white w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body">
							<h5 class="card-title text-center">Invite a Friend</h5>
							<label for="playerName" class="form-label">Player Name</label>
							<input type="text" class="form-control" id="playerName" placeholder="Enter Player Name" required>
							<div id="playerNamesContainer" class="mt-3"></div>
							<div class="d-flex justify-content-center mt-4">
								<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" id="startTournament">Start Game</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Game Sections -->
			<div class="row w-100">
				<!-- Pong Section -->
				<div class="col-md-6 text-center d-flex flex-column align-items-center">
					<img src="/static/media/assets/pongsplash.png" alt="Pong Game" class="img-fluid mt-2" style="width: 100%; height: auto;">
					<div class="card bg-dark text-white mt-3 w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body">
							<h5 class="card-title text-center">How To Play</h5>
							<p class="card-text">
								Player 1:<br>
								Move left/top: A<br>
								Move right/bottom: D<br>
							</p>
						</div>
					</div>
				</div>
				<!-- Asteroids Section -->
				<div class="col-md-6 text-center d-flex flex-column align-items-center">
					<img src="/static/media/assets/asteroidssplash.png" alt="Asteroids Game" class="img-fluid mt-2" style="width: 100%; height: auto;">
					<div class="card bg-dark text-white mt-3 w-100" style="border: 1px solid #343a40; opacity: 0.8;">
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
				</div>
			</div>
		</div>
	`;

	return $games;
}