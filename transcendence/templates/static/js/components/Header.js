export default function Header() {
	const $header = document.createElement('header');
	$header.innerHTML = `
		<nav class="navbar navbar-expand-lg d-flex justify-content-between" style="background: transparent;">
			<h1 class="fw-bold text-center text-white display-6 ms-3" data-path="/">ft_transcendence</h1>
			<div class="d-flex">
				<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg" data-path="/login">Login</button>
				<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg me-3" data-path="/createaccount">Create Account</button>
				<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg" data-path="/dashboard">Dashboard</button>
			</div>
		</nav>
		<div style="position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 100;">
			<audio id="audioplayer" controls autoplay loop style="max-width: 300px; width: 100%;">
				<source src="/app/assets/music/track1.mp3" type="audio/mp3">
			</audio>
			<select id="musicSelection" style="display: block; margin: 0 auto;">
				<option value="/app/assets/music/track1.mp3">Hungarian Dance</option>
				<option value="/app/assets/music/track2.mp3">The Ascent (version a)</option>
				<option value="/app/assets/music/track3.mp3">Midnight Explosion</option>
				<option value="/app/assets/music/track4.mp3">Maximum Overdrive</option>
			</select>
		</div>
		<video id="videoplayer" autoplay loop muted
			style="pointer-events: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;">
			<source src="/app/assets/1.mp4" type="video/mp4">
		</video>
	`;
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

	return $header;
}