import { navigate } from '../../helpers/App.js';
let selectedGameType = 'Pong';

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
				<!-- Select Game Card -->
				<div class="col-md-6 d-flex align-items-stretch">
					<div class="card bg-dark text-white w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body" id="divGameType">
							<h5 class="card-title text-center">Select Game</h5>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameType" id="Pong" value="Pong" checked>
								<label class="form-check-label" for="Pong" >Pong</label>
							</div>
							<div class="form-check">
								<input class="form-check-input" type="radio" name="gameType" id="Asteroids" value="Asteroids">
								<label class="form-check-label" for="Asteroids" >Asteroids</label>
							</div>
							</div>
						</div>
					</div>
					<div class="col-md-6 d-flex align-items-stretch">
					<div class="card bg-dark text-white w-100" style="border: 1px solid #343a40; opacity: 0.8;">
						<div class="card-body">
							<h5 class="card-title text-center">Invitations</h5>
								<div class="card-body">
								${dataRemote.remote_game_invitations.length > 0 ?
										dataRemote.remote_game_invitations.map(remote_game_invitations => `
										<p>${remote_game_invitations.sender__user__username} #${remote_game_invitations.game_id}
										<button id="AcceptRequest-${remote_game_invitations.game_id}" value="${remote_game_invitations.game_id}" type="button" class="btn btn-success btn-sm ml-2">✔️</button>
            							<button id="RejectRequest-${remote_game_invitations.game_id}" value="${remote_game_invitations.game_id}" type="button" class="btn btn-danger btn-sm ml-2">X</button>
            							</p>
									`).join('') :
										'<p>You currently have no friend requests.</p>'
								}
								</div>
						</div>
					</div>
					</div>
				</div>
			<!-- Send invitation -->
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
			<!-- Game Especifications -->
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


	$games.addEventListener('change', (event) => {
		if (event.target.name === 'gameType') {
			event.preventDefault();
			selectedGameType = document.querySelector('input[name="gameType"]:checked').value;
		}
		});

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

		const response = await fetch('/send-game-invitation/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded', // or 'application/json'
				'X-CSRFToken': getCSRFToken(), // Make sure you include your CSRF token
			},
			body: JSON.stringify({
				'username': username,
				'game_name': selectedGameType
			})
		})
		const result = await response.json();

		if (response.ok) {
			returnedMessage.innerHTML = '<p class="text-success">Game invitation sent successfully!</p>';
			setTimeout(() => {
				returnedMessage.innerHTML = '<p </p>';
			}, 2000);
			document.body.innerHTML = `
			<div class="vh-100 d-flex flex-column align-items-center justify-content-center">
				<h5>Waiting for the other opponent...</h5>
			</div>
			`;

			const socket = new WebSocket(`ws://${window.location.host}/ws/game/${result.game_id}/`);

			socket.onmessage = function(event) {
				const data = JSON.parse(event.data);
				if (data.message.includes('joined')) {
					navigate('/pongremote');
				}
			};
			// navigate('/pongremote');
		} else {
			returnedMessage.innerHTML = `<p class="text-danger">Failed to send game invitation! ${result.message} </p>`;
			setTimeout(() => {
				returnedMessage.innerHTML = '<p </p>';
			}, 2000);
		}
	});

		dataRemote.remote_game_invitations.forEach(remote_game_invitations => {
			// Adding event listener for the accept button
			document.getElementById(`AcceptRequest-${remote_game_invitations.game_id}`).addEventListener('click', async function() {
				console.log('user que vai:', remote_game_invitations.sender__user__username)
				// const game_id = document.getElementById('AcceptRequest-${remote_game_invitations.game_id}').value;
				const response = await fetch('/accept-game-invitation/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
					},
					body: JSON.stringify({
						'username': remote_game_invitations.sender__user__username,
						'game_id': remote_game_invitations.game_id// Send the username in the request body
					}),
				})

				const result = await response.json();

				if (response.ok) {
					console.log('Game accepted. Redirecting to remote play...');
					const gameId = result.game_id;
					document.body.innerHTML = `
					<div class="vh-100 d-flex flex-column align-items-center justify-content-center">
						<h5>Connecting to game...</h5>
					</div>
					`;

					// Connect to the WebSocket for this game
					const socket = new WebSocket(`ws://${window.location.host}/ws/game/${gameId}/`);

					socket.onmessage = function (event) {
						const data = JSON.parse(event.data);
						if (data.message.includes('joined')) {
							console.log('Both players connected. Starting game...');
							navigate('/pongremote');
						}
					}
				} else {
					setTimeout(() => {
						console.log('passou aqui 2', result);
					}, 2000);
				}
			});

			document.getElementById(`RejectRequest-${remote_game_invitations.game_id}`).addEventListener('click', async function() {
				// const game_id = document.getElementById('RejectRequest-${remote_game_invitations.sender__user__username}').value;
				const response = await fetch('/reject-game-invitation/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
					},
					body: JSON.stringify({
						'username': remote_game_invitations.sender__user__username,
						'game_id': remote_game_invitations.game_id// Send the username in the request body
					}),
				})
				const result = await response.json();

				if (response.ok) {
					setTimeout(() => {
						console.log('passou aqui 3', result);
						navigate('/');
					}, 1000);
				} else {
					setTimeout(() => {
						console.log('passou aqui 4', result);
					}, 1000);
				}
			});
		});

	})
	.catch((error) => {
		console.log("error", error);
		$games.innerHTML = base;
	});
	return $games;
}