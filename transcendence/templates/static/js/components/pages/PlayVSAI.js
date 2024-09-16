export default function PlayVsAI() {
	const $games = document.createElement('games')
	$games.innerHTML = `
		<div class="vh-100 d-flex align-items-center justify-content-center position-relative">
			<div class="d-flex justify-content-center">
				<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/pong">Pong</button>
				<button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/asteroids">Asteroids</button>
			</div>
		</div>
	`
	return $games
}