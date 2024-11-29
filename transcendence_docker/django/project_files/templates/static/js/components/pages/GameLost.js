export default function GameLost() {
	const $gameLost = document.createElement('gamelost');
	$gameLost.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-center text-center">
			<h2 class="text-white">Game Over player 1!</h2>
			<p class="text-white">You'll get them next time!</p>
			<div class="mt-3">
				<button class="btn btn-purple btn-lg text-white shadow-lg" data-path="/">Go Back To HomePage</button>
			</div>
		</div>
	`;

	$gameLost.querySelector('button').addEventListener('click', (event) => {
		event.preventDefault();
		const path = event.target.getAttribute('data-path');
		navigate(path);
	});

	return $gameLost;
}