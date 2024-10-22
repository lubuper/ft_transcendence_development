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

const colorPaths = [
	'/static/media/assets/color/Green.png',
	'/static/media/assets/color/Cyan.png',
	'/static/media/assets/color/Orange.png',
	'/static/media/assets/color/Purple.png'
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
									${avatarPaths.map(path => `<img src="${path}" class="avatar-option rounded-circle m-1" alt="Avatar" style="width: 50px; height: 50px; cursor: pointer;">`).join('')}
								</div>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Select Color</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									 ${colorPaths.map((path, index) =>
										`<img src="${path}" class="color-option rounded-circle m-1 ${index === 0 ? 'selected-color' : ''}" alt="Color" style="width: 50px; height: 50px; cursor: pointer;">`
									).join('')}
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
							<div class="card-header">Friend22s: ${matchHistory.friends_count}</div>
							<div class="card-body">
							${matchHistory.friends.map(friend => `
							<p>
      							${friend ? friend : 'You currently have no friends.'}
      							${friend ? `
      							  <img src="/static/media/icons/chat-icon.png" 
      							       class="chat-icon ml-2" 
      							       alt="Chat" 
      							       style="width: 20px; height: 20px; cursor: pointer; filter: invert(29%) sepia(81%) saturate(2034%) hue-rotate(186deg) brightness(95%) contrast(101%);" 
      							       data-friend="${friend}"
      							       title="Chat with ${friend}">
      							` : ''}
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

	const colorOptions = document.querySelectorAll('.color-option');

	colorOptions.forEach(option => {
		option.addEventListener('click', function() {
				// Remove the red border from all color options
			colorOptions.forEach(opt => opt.classList.remove('selected-color'));

				// Add the red border to the clicked color
			this.classList.add('selected-color');

				// Store selected color in localStorage
			const selectedColorUrl = this.src;
			localStorage.setItem('selectedColorUrl', selectedColorUrl);
			console.log('Selected color URL:', selectedColorUrl); // Debugging log
		});
	});


	const storedColorUrl = localStorage.getItem('selectedColorUrl');
	if (storedColorUrl) {
		colorOptions.forEach(option => {
			if (option.src === storedColorUrl) {
				option.classList.add('selected-color');
			}
		});
	}

	clearStorageButton.addEventListener('click', function() {
		localStorage.clear();
		alert('Local storage cleared!');
	});

	document.getElementById('SearchButton').addEventListener('click', async function() {
		event.preventDefault();
		const username = document.getElementById('searchInput').value;

		const response = await fetch('/send-friend-request/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded', // or 'application/json'
				'X-CSRFToken':getCSRFToken() // Make sure you include your CSRF token
			},
			body: JSON.stringify({
				'username': username
			})
		})
		// .then(response => response.json())
		const result = await response.json();	
		const friendMessage = document.getElementById('friend-message');

		if (response.ok) {
			friendMessage.innerHTML = '<p class="text-success">Friend request sent successfully!</p>';
		} else {
			friendMessage.innerHTML = `<p class="text-danger">Failed to send friend request! ${result.message} </p>`;
		}
		// .catch(error => {
		// 	console.error('Error:', error);
		// 	alert('There was an error sending the friend request.');
		// });
	});

	});
	return $dashboard;
}

