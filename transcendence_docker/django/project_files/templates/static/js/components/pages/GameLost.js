export default function GameLost() {
	const $gameLost = document.createElement('gamelost');
	$gameLost.innerHTML = `
		<div id="gameWin" class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
			<div>
				<h2>Game Over player 1!</h2>
				<p>You'll get them next time!</p>
			</div>
			<div class="d-flex">
				<button class="btn btn-purple btn-lg text-white shadow-lg mt-3 custom-button" data-path="/">Go Back To HomePage</button>
			</div>
		</div>
	`
	return $gameLost
}