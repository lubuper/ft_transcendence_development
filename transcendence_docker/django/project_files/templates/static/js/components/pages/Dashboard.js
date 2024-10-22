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

const colorNames = [
	'0x8000ff',
	'0xff8000',
	'0x00ff00',
	'0x00ffff'
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
		console.log("matchHistory: ", matchHistory)

		const pongRank = calculateRankedStats(matchHistory.match_history, "Pong")
		const astRank = calculateRankedStats(matchHistory.match_history, "Asteroids")
	$dashboard.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-start position-relative" style="background-color: rgba(0, 0, 0, 0.6); color: white;">
			<div class="container mt-3">
				<div class="row align-items-start">
					<div class="col-md-3">
						<div class="card bg-dark text-white mb-3">
							<div class="card-body text-center">
								<img id="avatar" src="${avatarPaths[0]}" class="rounded-circle mb-3" alt="Avatar" style="width: 100px; height: 100px;">
								<h5 class="card-title">${matchHistory.username}</h5>
								<p class="card-text">
									<img src="/static/media/rank/${pongRank.rank}.png" 
										alt="${pongRank.rank}" 
										style="width: 64px; height: 64px; margin-right: 2px;">
									${pongRank.result}
									<span class="tooltiptext">The game ranking starts after 5 matches, and there are 5 of them. Good luck!</span>
								</p>
								<p class="card-text">
									<img src="/static/media/rank/${astRank.rank}.png" 
										alt="${astRank.rank}" 
										style="width: 64px; height: 64px; margin-right: 2px;">
									${astRank.result}
									<span class="tooltiptext">The game ranking starts after 5 matches, and there are 5 of them. Good luck!</span>
								</p>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Select Ship</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									${avatarPaths.map((path, index) =>
										`<img src="${path}" data-ship-id="${index + 1}" class="avatar-option rounded-circle m-1" alt="Avatar" style="width: 50px; height: 50px; cursor: pointer;">`
									).join('')}
									</div>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Select Color</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									${colorNames.map(names => `<img src="/static/media/assets/color/${names}.png" data-color-id="${names}" class="color-option rounded-circle m-1 ${names === matchHistory.game_customization.color ? 'selected-color' : ''}" alt="Color" style="width: 50px; height: 50px; cursor: pointer;">`).join('')}
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
									${matchHistory.match_history.map(match => `
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
							<form id="send-friend-request">
								<input type="text" class="form-control mb-3" id="searchInput" name="username" placeholder="Search friends to add...">
								<button id="SearchButton" type="submit" class="btn btn-purple btn-custom mx-3 nav-link text-white shadow-lg">Search</button>
								<div class="card-body" id="friend-message"></div>
							</form>
							<div class="card-header">Friends: ${matchHistory.friends_count}</div>
							<div class="card-body">
							${matchHistory.friends.map(friend => `
							<p>
								${friend ? friend : 'You currently have no friends.'}
							</p>
						`).join('')}
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

	function calculateRankedStats(matchHistory, gameName) {
		const stats = { wins: 0, total: 0 };
		matchHistory.forEach(match => {
			if (match.game === gameName) {
				if (match.result === "win") {
					stats.wins++;
				}
				stats.total++;
			}
		});

		let resultString;
		let rank;

		if (stats.total < 5) {
			resultString = `${gameName}: No rank ${stats.wins}/${stats.total}`;
			rank = "NoRank";
		} else {
			const winPercentage = (stats.wins / stats.total) * 100;

			if (winPercentage <= 20) {
				rank = "Bronze";
			} else if (winPercentage <= 40) {
				rank = "Silver";
			} else if (winPercentage <= 60) {
				rank = "Gold";
			} else if (winPercentage <= 80) {
				rank = "Platinum";
			} else {
				rank = "Diamond";
			}
			resultString = `${gameName}: ${rank} ${stats.wins}/${stats.total}`;
		}
		return {
			result: resultString,
			rank: rank
		};
	}

		const avatarElement = $dashboard.querySelector('#avatar');
		const avatarOptions = $dashboard.querySelectorAll('.avatar-option');
		const colorOptions = document.querySelectorAll('.color-option');
		const csrfToken = getCSRFToken();

		let selectedAvatarUrl = null;
		let selectedColorUrl = null;

		// Event listener for avatar selection
		// avatarOptions.forEach(option => {
		// 	option.addEventListener('click', function() {
		// 		selectedAvatarUrl = this.src;
		// 		avatarElement.src = selectedAvatarUrl;
		//
		// 		localStorage.setItem('selectedAvatarUrl', selectedAvatarUrl);
		// 		sendCustomizationToServer();
		// 	});
		// });
		avatarOptions.forEach(option => {
			option.addEventListener('click', function() {
				const selectedAvatarId = this.getAttribute('data-ship-id');  // Get the ship ID
				avatarElement.src = this.src;

				localStorage.setItem('selectedAvatarId', selectedAvatarId);  // Store the ID
				sendCustomizationToServer();  // Send to server with the correct ID
			});
		});

		// Event listener for color selection
		colorOptions.forEach(option => {
			option.addEventListener('click', function() {
				colorOptions.forEach(opt => opt.classList.remove('selected-color'));
				this.classList.add('selected-color');
				const selectedColorId = this.getAttribute('data-color-id');  // Get the color ID
				selectedColorUrl = this.src;

				localStorage.setItem('selectedColorUrl', selectedColorId);
				sendCustomizationToServer();
			});
		});

		// Function to send the selected ship (avatar) and color to the Django backend
		function sendCustomizationToServer() {
			const selectedAvatarId = localStorage.getItem('selectedAvatarId');
			const selectedColor = localStorage.getItem('selectedColorUrl');

			console.log('ship: ', selectedAvatarId)
			console.log('color: ', selectedColor)
			if (selectedAvatarId || selectedColor) {
				fetch('/save-customization/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': getCSRFToken(),  // Ensure CSRF token is sent
					},
					body: JSON.stringify({
						ship: selectedAvatarId,
						color: selectedColor
					}),
				}).then(response => response.json())
					.then(data => {
						if (data.status === 'success') {
							console.log('Customization saved');
						} else {
							console.error('Error saving customization:', data.error);
						}
					});
			} else {
				console.error('Missing ship or color selection.');
			}
		}

		// Load stored values from localStorage on page load
		document.addEventListener('DOMContentLoaded', function() {
			const storedAvatarUrl = localStorage.getItem('selectedAvatarUrl');
			const storedColorUrl = localStorage.getItem('selectedColorUrl');

			if (storedAvatarUrl) {
				avatarElement.src = storedAvatarUrl;
			}

			if (storedColorUrl) {
				colorOptions.forEach(option => {
					if (option.src === storedColorUrl) {
						option.classList.add('selected-color');
					}
				});
			}
		});

	document.getElementById('SearchButton').addEventListener('click', async function() {
		event.preventDefault();
		const username = document.getElementById('searchInput').value;

		const response = await fetch('/send-friend-request/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded', // or 'application/json'
				'X-CSRFToken': getCSRFToken(), // Make sure you include your CSRF token
			},
			body: JSON.stringify({
				'username': username
			})
		})
		const result = await response.json();	
		const friendMessage = document.getElementById('friend-message');

		if (response.ok) {
			friendMessage.innerHTML = '<p class="text-success">Friend request sent successfully!</p>';
		} else {
			friendMessage.innerHTML = `<p class="text-danger">Failed to send friend request! ${result.message} </p>`;
		}
	});

	});
	return $dashboard;
}

