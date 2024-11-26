import {getSelectedGameID} from "./components/pages/RemotePlay.js";

// <div className="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
// 	<div className="card bg-dark text-white mb-3" style="width: 400px;">
// 		<div className="card-body text-center">
// 			<img src="/static/media/esperando.jpg"
// 				 alt="Waiting Alien"
// 				 style="width: 300px; height: 300px; border-radius: 10px; margin-bottom: 20px;">
// 				<h5 className="card-title">lets go, esse é o game id: ${gameId}</h5>
// 		</div>
// 	</div>
// </div>

export default function PongRemote() {
	const gameId = getSelectedGameID();
	const $remotePong = document.createElement('div');
		$remotePong.innerHTML = `
		<div id="game">
            <div class="card bg-dark text-white mt-3 w-100" id="waiting" style="display: none;">Waiting for the other player to join...</div>
            <div id="game-board" style="display: none;">
                <div class="card bg-dark text-white mt-3 w-100">
                    Player 1 Score: <span id="player1-score">0</span>
                </div>
                <div class="card bg-dark text-white mt-3 w-100">
                    Player 2 Score: <span id="player2-score">0</span>
                </div>
                <button id="increment-btn">Hit!</button>
            </div>
        </div>
	`;

	const playerNumber = prompt("Enter your player number (1 or 2):");
	const websocket = new WebSocket(`ws://${window.location.host}/ws/game/${gameId}/`);

	let playerScore = 0;

	const waitingDiv = $remotePong.querySelector("#waiting");
	const gameBoardDiv = $remotePong.querySelector("#game-board");
	const player1ScoreSpan = $remotePong.querySelector("#player1-score");
	const player2ScoreSpan = $remotePong.querySelector("#player2-score");
	const incrementButton = $remotePong.querySelector("#increment-btn");

	websocket.onmessage = function (event) {
		const data = JSON.parse(event.data);

		console.log('data::::::', data.action);
		if (data.action === 'waiting') {
			waitingDiv.style.display = "block";
			gameBoardDiv.style.display = "none";
		} else if (data.action === 'start_game') {
			waitingDiv.style.display = "none";
			gameBoardDiv.style.display = "block";
		} else if (data.action === 'update_scores') {
			if (data.player === 1) {
				player1ScoreSpan.textContent = data.score;
			} else if (data.player === 2) {
				player2ScoreSpan.textContent = data.score;
			}
		} else if (data.action === 'player_left') {
			console.log('nao passa aqui??::::::', data.action);
			// Show an alert when a player leaves
			alert(data.message);

			// Return to waiting state
			waitingDiv.style.display = "block";
			gameBoardDiv.style.display = "none";
		}
	};

	incrementButton.addEventListener("click", () => {
		playerScore += 1;
		websocket.send(JSON.stringify({
			action: "update_score",
			player: parseInt(playerNumber),
			score: playerScore,
		}));
	});

	return $remotePong;
}