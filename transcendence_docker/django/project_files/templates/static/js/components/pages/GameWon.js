export default function GameWon() {
	const $gameWon = document.createElement('gamewon');
	$gameWon.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-center text-center">
			<h2 class="text-white">Congratulations player 1!</h2>
			<p class="text-white">You have won!</p>
			<div class="mt-3">
				<button class="btn btn-purple btn-lg text-white shadow-lg" data-path="/">Go Back To HomePage</button>
			</div>
		</div>
	`;

	$gameWon.querySelector('button').addEventListener('click', (event) => {
		event.preventDefault();
		const path = event.target.getAttribute('data-path');
		navigate(path);
	});

	return $gameWon;
}