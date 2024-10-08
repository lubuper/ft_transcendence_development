export default function Header() {
	const $header = document.createElement('header');

	const base = `
		<div style="position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 100;">
			<audio id="audioplayer" controls autoplay loop style="max-width: 300px; width: 100%;">
				<source src="/static/media/assets/music/track1.mp3" type="audio/mp3">
			</audio>
			<select id="musicSelection" style="display: block; margin: 0 auto;">
				<option value="/static/media/assets/music/track1.mp3">Hungarian Dance</option>
				<option value="/static/media/assets/music/track2.mp3">The Ascent (version a)</option>
				<option value="/static/media/assets/music/track3.mp3">Midnight Explosion</option>
				<option value="/static/media/assets/music/track4.mp3">Maximum Overdrive</option>
			</select>
		</div>
		<video id="videoplayer" autoplay loop muted
			style="pointer-events: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;">
			<source src="/static/media/assets/1.mp4" type="video/mp4">
		</video>
	`

	$header.innerHTML = base;

	const audioPlayer = $header.querySelector('#audioplayer');
	const musicSelection = $header.querySelector('#musicSelection');

	audioPlayer.volume = 0.2;

	musicSelection.addEventListener('change', function() {
		// Fade out the current track
		let currentVolume = audioPlayer.volume;
		const fadeOutInterval = setInterval(() => {
			if (currentVolume > 0.05) {
				currentVolume -= 0.05;
				audioPlayer.volume = currentVolume;
			} else {
				clearInterval(fadeOutInterval);
				audioPlayer.src = this.value;
				audioPlayer.volume = 0; // Start with volume at 0
				audioPlayer.play();

				const fadeInInterval = setInterval(() => {
					if (audioPlayer.volume < 0.2) {
						audioPlayer.volume += 0.05;
					} else {
						clearInterval(fadeInInterval);
					}
				}, 100);
			}
		}, 100);
	});

	fetch('/current-user/')
		.then(async (response) => {
			const user = await response.json();

			$header.innerHTML = `
			<nav class="navbar navbar-expand-lg d-flex justify-content-between" style="background: transparent;">
            <h1 class="fw-bold text-center text-white display-6 ms-3" data-path="/">ft_transcendence</h1>
            <div class="d-flex align-items-center">
                <button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg d-flex align-items-center" data-path="/profile">
                    <img src="../../../media/profile_pics/default_profile.jpg" alt="${user.username}'s profile picture" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px;">
                    ${user.username}
                </button>
                <button class="btn btn-danger btn-custom mx-1 nav-link text-white shadow-lg" id="logout-btn">Logout</button>
                <button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg" data-path="/dashboard">Dashboard</button>
            </div>
        </nav>
        	${base}
	`;

			if (user.username) {
				const logoutButton = $header.querySelector('#logout-btn');
				logoutButton.addEventListener('click', async () => {
					await fetch('/logout/', { method: 'POST', credentials: 'same-origin' });
					setTimeout(() => {
						window.location.href = '/';  // Redirect to home page after 1 seconds
					}, 1000);
				});
			}

		})
		.catch((error) => {
			console.log("error", error)
			$header.innerHTML = `
			<nav class="navbar navbar-expand-lg d-flex justify-content-between" style="background: transparent;">
				<h1 class="fw-bold text-center text-white display-6 ms-3" data-path="/">ft_transcendence</h1>
				<div class="d-flex">
					<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg" data-path="/login">Login</button>
					<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg me-3" data-path="/createaccount">Create Account</button>
				</div>
			</nav>
			${base}
			`
		})
	return $header;
}