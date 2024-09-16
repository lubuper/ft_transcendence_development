// Assuming you have the paths to the images
const avatarPaths = [
	'/app/assets/ships/splash/1.png',
	'/app/assets/ships/splash/2.png',
	'/app/assets/ships/splash/3.png',
	'/app/assets/ships/splash/4.png',
	'/app/assets/ships/splash/5.png',
	'/app/assets/ships/splash/6.png',
	'/app/assets/ships/splash/7.png',
	'/app/assets/ships/splash/8.png',
	'/app/assets/ships/splash/9.png'
];

export function saveMatchHistory(match) {
	const matchHistory = loadMatchHistory();
	matchHistory.push(match);
	localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
}

export function loadMatchHistory() {
	const data = localStorage.getItem('matchHistory');
	return data ? JSON.parse(data) : [];
}

export default function DashBoard() {
	const matchHistory = loadMatchHistory();

	const $dashboard = document.createElement('dashboard');
	$dashboard.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-start position-relative" style="background-color: rgba(0, 0, 0, 0.6); color: white;">
			<div class="container mt-3">
				<div class="row align-items-start">
					<div class="col-md-3">
						<div class="card bg-dark text-white mb-3">
							<div class="card-body text-center">
								<img id="avatar" src="${avatarPaths[0]}" class="rounded-circle mb-3" alt="Avatar" style="width: 100px; height: 100px;">
								<h5 class="card-title">Username</h5>
								<p class="card-text">Player's Bio or additional info</p>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">
								<button class="btn btn-link text-white" type="button" data-bs-toggle="collapse" data-bs-target="#tournamentsCollapse" aria-expanded="false" aria-controls="tournamentsCollapse">
									Tournaments
								</button>
							</div>
							<div id="tournamentsCollapse" class="collapse">
								<ul class="list-group list-group-flush">
									<li class="list-group-item bg-dark text-white">Tournament 1</li>
									<li class="list-group-item bg-dark text-white">Tournament 2</li>
								</ul>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">
								<button class="btn btn-link text-white" type="button" data-bs-toggle="collapse" data-bs-target="#matchHistoryCollapse" aria-expanded="false" aria-controls="matchHistoryCollapse">
									Match History
								</button>
							</div>
							<div id="matchHistoryCollapse" class="collapse">
								<div class="card-body">
									${matchHistory.map(match => `
										<p>${match.timestamp}: ${match.score} -> ${match.result}</p>
									`).join('')}
								</div>
							</div>
						</div>
					</div>
					<div class="col-md-3">
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Chat</div>
							<div class="card-body">
								<p>Message 1</p>
								<p>Message 2</p>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Select Ship</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									${avatarPaths.map(path => `<img src="${path}" class="avatar-option rounded-circle m-1" alt="Avatar" style="width: 50px; height: 50px; cursor: pointer;">`).join('')}
								</div>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Settings</div>
							<div class="card-body">
								<button id="clearStorage" class="btn btn-danger">Clear Storage</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	const avatarElement = $dashboard.querySelector('#avatar');
	const avatarOptions = $dashboard.querySelectorAll('.avatar-option');
	const clearStorageButton = $dashboard.querySelector('#clearStorage');

	avatarOptions.forEach(option => {
		option.addEventListener('click', function() {
			const selectedAvatarUrl = this.src;
			avatarElement.src = selectedAvatarUrl;
			console.log('Selected avatar URL:', selectedAvatarUrl); // Debugging log
			localStorage.setItem('selectedAvatarUrl', selectedAvatarUrl);
		});
	});

	const storedAvatarUrl = localStorage.getItem('selectedAvatarUrl');
	if (storedAvatarUrl) {
		avatarElement.src = storedAvatarUrl;
	}

	clearStorageButton.addEventListener('click', function() {
		localStorage.clear();
		alert('Local storage cleared!');
	});

	return $dashboard;
}