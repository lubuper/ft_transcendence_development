// Assuming you have the paths to the images
const avatarPaths = [
	'/static/media/assets/ships/splash/1.png',
	'/static/media/assets/ships/splash/2.png',
	'/static/media/assets/ships/splash/3.png',
	'/static/media/assets/ships/splash/4.png',
	'/static/media/assets/ships/splash/5.png',
	'/static/media/assets/ships/splash/6.png',
	'/static/media/assets/ships/splash/7.png',
	'/static/media/assets/ships/splash/8.png',
	'/static/media/assets/ships/splash/9.png'
];

export function saveMatchHistory(match) {
	// const matchHistory = loadMatchHistory();
	// matchHistory.push(match);
	// localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
	console.log('a info que chega:', match);
	return fetch('/api/save-match-history/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCSRFToken() // Ensure CSRF protection for Django
		},
		body: JSON.stringify(match) // Convert match object to JSON
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Failed to save match history');
		}
		return response.json(); // Parse the JSON response
	})
	.then(data => {
		console.log('Match history saved successfully:', data);
	})
	.catch(error => {
		console.error('Error saving match history:', error);
	});
}

function getCSRFToken() {
	const name = 'csrftoken';
	const cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		const trimmedCookie = cookie.trim();
		if (trimmedCookie.startsWith(name + '=')) {
			return decodeURIComponent(trimmedCookie.substring(name.length + 1));
		}
	}
	return null;
}

export async function getMatchHistory() {
	try {
		const response = await fetch('/api/load-match-history/');
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const matchHistory = await response.json();
		return matchHistory;
	} catch (error) {
		console.error('Error fetching match history:', error);
		throw error; // Rethrow or handle the error as needed
	}
}

export default function DashBoard() {

	const $dashboard = document.createElement('dashboard');
	getMatchHistory().then(matchHistory => {
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
							<div class="card-header">Select Ship</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									${avatarPaths.map(path => `<img src="${path}" class="avatar-option rounded-circle m-1" alt="Avatar" style="width: 50px; height: 50px; cursor: pointer;">`).join('')}
								</div>
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
        								<p>
           									${match.game}: ${match.score} -> 
            								<span style="color: ${match.result === 'win' ? 'green' : 'red'};">
                								${match.result}
           									</span> 
            								at ${new Date(match.timestamp).toLocaleString('en-GB', {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
												hour12: true
											})}
        								</p>
    								`).join('')}
								</div>
							</div>
						</div>
					</div>
					<div class="col-md-3">
						<div class="card bg-dark text-white mb-3">
							<input type="text" class="form-control mb-3" id="searchInput" placeholder="Search friends to add...">
							<div class="card-header">Friends</div>
							<div class="card-body">
								<p>Friend 1</p>
								<p>Friend 2</p>
								<p>Friend 3</p>
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
	});
	return $dashboard;
}