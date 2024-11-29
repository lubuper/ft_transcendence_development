export default function GameWon() {
	const $gameWon = document.createElement('gamewon');
	$gameWon.innerHTML = `
		<div id="gameWin" class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
			<div>
				<h2>Congratulations player 1!</h2>
				<p>You have won!</p>
			</div>
			<div class="d-flex">
				<button class="btn btn-purple btn-lg text-white shadow-lg mt-3 custom-button" data-path="/">Go Back To HomePage</button>
			</div>
		</div>
	`
	return $gameWon
}