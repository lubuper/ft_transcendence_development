	const base = `
			<div class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
                <div class="card bg-dark text-white mb-3" style="width: 400px;">
                <div class="card-body text-center">
                <img src="/static/media/sadAlien.jpg" 
                     alt="Sad Alien" 
                     style="width: 300px; height: 300px; border-radius: 10px; margin-bottom: 20px;">
                <h5 class="card-title">You must be logged to play remote!</h5>
                </div>
                </div>
                <div class="d-flex">
						<button class="btn btn-purple btn-lg mt-3 nav-link text-white shadow-lg me-3" data-path="/login">Login</button>
						<button class="btn btn-purple btn-lg mt-3 nav-link text-white shadow-lg me-3" data-path="/createaccount">Create Account</button>
						<button class="btn btn-purple btn-lg text-white shadow-lg mt-3 custom-button" onclick="window.history.back()">Go Back To HomePage</button>
				</div>
            </div>
			`;


export async function getDataRemote() {
	try {
		const response = await fetch('/api/get-data-remote/');
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const dataRemote = await response.json();
		return dataRemote;
	}
	catch (error) {
		// console.error('Error fetching match history:', error);
		throw error; // Rethrow or handle the error as needed
	}
}

export default function RemotePlay(navigate) {
	const $games = document.createElement('div');
	getDataRemote().then(dataRemote => {
		console.log("dataRemote: ", dataRemote)
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
							<form id="send-friend-invitation">
								<input type="text" class="form-control mb-3" id="playerNameInvitation" name="username" placeholder="Enter Player Name" required>
								<div id="playerNamesContainer" class="mt-3"></div>
								<div class="d-flex justify-content-center mt-4">
									<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" id="startRemoteGame">Start Game</button>
								</div>
								<div class="card-body" id="returned-message"></div>
							</form>
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


	document.getElementById('startRemoteGame').addEventListener('click', async function() {
		event.preventDefault();
		const username = document.getElementById('playerNameInvitation').value;

		const returnedMessage = document.getElementById('returned-message');
		if (username === dataRemote.username)
		{
			returnedMessage.innerHTML = `<p class="text-danger">You can not play with yourself!</p>`;
			setTimeout(() => {
				returnedMessage.innerHTML = '<p </p>';
			}, 2000);
			return;
		}

		// const response = await fetch('/send-friend-request/', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded', // or 'application/json'
		// 		'X-CSRFToken': getCSRFToken(), // Make sure you include your CSRF token
		// 	},
		// 	body: JSON.stringify({
		// 		'username': username
		// 	})
		// })
		// const result = await response.json();
		//
		// if (response.ok) {
		// 	friendMessage.innerHTML = '<p class="text-success">Friend request sent successfully!</p>';
		// 	setTimeout(() => {
		// 		friendMessage.innerHTML = '<p </p>';
		// 	}, 2000);
		// } else {
		// 	friendMessage.innerHTML = `<p class="text-danger">Failed to send friend request! ${result.message} </p>`;
		// 	setTimeout(() => {
		// 		friendMessage.innerHTML = '<p </p>';
		// 	}, 2000);
		// }
	});

	})
	.catch((error) => {
		console.log("error", error);
		$games.innerHTML = base;
	});
	return $games;
}