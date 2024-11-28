export default function GameLost() {
	const $gameLost = document.createElement('gamelost');
	$gameLost.innerHTML = `
		<div id="gameWin" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.75); color: white; justify-content: center; align-items: center; text-align: center; font-size: 2em; z-index: 1000;">
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