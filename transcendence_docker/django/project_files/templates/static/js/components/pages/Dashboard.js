import { navigate } from '../../helpers/App.js';
import { setupChat } from './Client.js';


const avatarPaths = [
	'/static/media/assets/ships/splash/1.png',
	'/static/media/assets/ships/splash/7.png',
	'/static/media/assets/ships/splash/5.png',
	'/static/media/assets/ships/splash/4.png',
	'/static/media/assets/ships/splash/2.png',
	'/static/media/assets/ships/splash/6.png',
	'/static/media/assets/ships/splash/3.png',
	'/static/media/assets/ships/splash/9.png',
	'/static/media/assets/ships/splash/8.png'
];

export let currentFriend = '';

const colorNames = [
	'00ff00',
	'8000ff',
	'ff8000',
	'00ffff'
];

export function saveMatchHistory(match) {

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
		localStorage.setItem('selectedAvatarId', matchHistory.game_customization[0].ship);
		localStorage.setItem('selectedColorId', matchHistory.game_customization[0].color);
	$dashboard.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-start position-relative" style="background-color: rgba(0, 0, 0, 0.6); color: white;">
			<div class="container mt-3">
				<div class="row align-items-start">
					<div class="col-md-3">
						<div class="card bg-dark text-white mb-3">
							<div class="card-body text-center">
								<img id="avatar" src="/static/media/assets/ships/splash/${localStorage.getItem('selectedAvatarId')}.png" class="rounded-circle mb-3" alt="Avatar" style="width: 100px; height: 100px;">
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
										`<img src="${path}" data-ship-id="${index + 1}" class="avatar-option rounded-circle m-1 ${(index + 1).toString() === localStorage.getItem('selectedAvatarId') ? 'selected-color' : ''}" alt="Avatar" style="width: 50px; height: 50px; cursor: pointer;">`
									).join('')}
									</div>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">Select Color</div>
							<div class="card-body">
								<div class="d-flex flex-wrap">
									 ${colorNames.map((names) =>
										`<img src="/static/media/assets/color/${names}.png" data-color-id="#${names}" class="color-option rounded-circle m-1 ${`#${names}` === localStorage.getItem('selectedColorId') ? 'selected-color' : ''}" alt="Color" style="width: 50px; height: 50px; cursor: pointer;">`
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
							<div class="card-header">Friends: ${matchHistory.friends_count}</div>
							<div class="card-body" id="friends-list">
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
									<img src="/static/media/icons/profile.png" 
      							       class="profile-icon ml-2" 
      							       alt="Profile-friend" 
      							       style="width: 20px; height: 20px; cursor: pointer; filter: invert(29%) sepia(81%) saturate(2034%) hue-rotate(186deg) brightness(95%) contrast(101%);" 
      							       data-friend="${friend}"
      							       id="Profile-id-${friend}"
      							` : ''}
    						</p>
						`).join('')}
							</div>
							<div class="card-header">Friend Requests:</div>
							<div class="card-body">
							${matchHistory.friend_requests.length > 0 ? 
								matchHistory.friend_requests.map(friend_request => `
									${friend_request}
									<button id="AcceptFriendRequest-${friend_request}" type="button" class="btn btn-success btn-sm ml-2">✔️</button>
            						<button id="RejectFriendRequest-${friend_request}" type="button" class="btn btn-danger btn-sm ml-2">X</button>
								`).join('') : 
								'<p>You currently have no friend requests.</p>'
							}
							</div>
							<div class="card-body" id="request-message"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
	const chatIcons = document.querySelectorAll('.chat-icon');
	chatIcons.forEach(icon => {
	    icon.addEventListener('click', (event) => {
	        const friendName = event.currentTarget.getAttribute('data-friend');
	        openChatBox(friendName);
	    });
	});

	function openChatBox(friendName) {
		const existingChatBox = document.getElementById(`chat-box-${friendName}`);
		if (existingChatBox) {
			return; // Exit if the chat box is already open
		}
	
		currentFriend = friendName;
		const shortName = friendName.length > 6 ? friendName.slice(0, 6) : friendName; // Limit to first 6 characters
		const chatBox = document.createElement('div');
		chatBox.classList.add('chat-popup');
		chatBox.id = `chat-box-${friendName}`; // Set a unique ID for each friend's chat box
	
		chatBox.innerHTML = `
			<div class="chat-box">
				<div class="chat-header">
					<span>${shortName} Live-Chat</span>
					<button class="minimize-btn">-</button> <!-- Minimize Button -->
					<button class="close-btn">&times;</button>
				</div>
				<div class="chat-content"> <!-- Wrapping content to toggle visibility -->
					<div class="messages" id="messages-${friendName}">
						<!-- Messages will load here -->
					</div>
					<div class="input-container">
						<input type="text" class="message-input" placeholder="Type your message...">
						<button class="sender">SEND</button>
					</div>
				</div>
			</div>
		`;
	
		document.body.appendChild(chatBox);
	
		// Close the chat box with animation when the X button is clicked
		chatBox.querySelector('.close-btn').addEventListener('click', () => {
			chatBox.classList.add('fade-out'); // Add fade-out class for close animation
			setTimeout(() => {
				chatBox.remove(); // Remove the chat box after the animation finishes
			}, 300); // Delay matches the duration of the fadeOut animation (0.3s)
		});
	
		// Minimize/maximize functionality for the chat box
		const minimizeButton = chatBox.querySelector('.minimize-btn');
		const chatContent = chatBox.querySelector('.chat-content');
		minimizeButton.addEventListener('click', () => {
			chatContent.classList.toggle('hidden'); // Toggle visibility
			chatBox.style.height = chatContent.classList.contains('hidden') ? 'auto' : '400px'; // Adjust height based on state
			minimizeButton.textContent = chatContent.classList.contains('hidden') ? '+' : '-'; // Change button text
		});
	
		setupChat(friendName); // Initialize chat functionality for the friend
	}

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
		const colorOptions = $dashboard.querySelectorAll('.color-option');
		const profileIcons = document.querySelectorAll('.profile-icon');

		profileIcons.forEach(profile => {
			profile.addEventListener('click', function() {
				const friend = profile.getAttribute('data-friend');
				profileFriend(friend);

			})
		})

		avatarOptions.forEach(option => {
			option.addEventListener('click', function() {
				avatarOptions.forEach(opt => opt.classList.remove('selected-color'));
				const selectedAvatarId = this.getAttribute('data-ship-id');  // Get the ship ID
				avatarElement.src = this.src;
				this.classList.add('selected-color');

				localStorage.setItem('selectedAvatarId', selectedAvatarId);  // Store the ID
				sendCustomizationToServer();  // Send to server with the correct ID
			});
		});

		// Event listener for color selection
		colorOptions.forEach(option => {
			option.addEventListener('click', function() {
				colorOptions.forEach(opt => opt.classList.remove('selected-color'));
				const selectedColorId = this.getAttribute('data-color-id');
				this.classList.add('selected-color');

				localStorage.setItem('selectedColorId', selectedColorId);
				sendCustomizationToServer();
			});
		});

		// Function to send the selected ship (avatar) and color to the Django backend
		function sendCustomizationToServer() {
			const selectedAvatarId = localStorage.getItem('selectedAvatarId');
			const selectedColor = localStorage.getItem('selectedColorId');

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
			setTimeout(() => {
				friendMessage.innerHTML = '<p </p>';
			}, 2000);
		} else {
			friendMessage.innerHTML = `<p class="text-danger">Failed to send friend request! ${result.message} </p>`;
			setTimeout(() => {
				friendMessage.innerHTML = '<p </p>';
			}, 2000);
		}
	});

		function profileFriend(friendName) {
			console.log('friend que chega', friendName);
			currentFriend = friendName;
			console.log('friend que salva', currentFriend);
			navigate('/profileFriend');
		}

	matchHistory.friend_requests.forEach(friend_request => {
		// Adding event listener for the accept button
		document.getElementById(`AcceptFriendRequest-${friend_request}`).addEventListener('click', function() {
			fetch('/accept-friend-request/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
				},
				body: JSON.stringify({
					'username': friend_request // Send the username in the request body
				}),
			})
			.then(response => response.json())
			.then(data => {
				if (data.message) {
					alert(data.message); // Display success message
					location.reload(); // Reload the page or update the UI as needed
				} else if (data.error) {
					alert(data.error); // Display error message if there's an issue
				}
			})
			.catch(error => {
				console.error('Error:', error);
				alert('There was an error accepting the friend request.');
			});
		});
	
		// Adding event listener for the reject button
		document.getElementById(`RejectFriendRequest-${friend_request}`).addEventListener('click', function() {
			fetch('/reject-friend-request/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
				},
				body: JSON.stringify({
					'username': friend_request // Send the username in the request body
				}),
			})
			.then(response => response.json())
			.then(data => {
				if (data.message) {
					alert(data.message); // Display success message
					location.reload(); // Reload the page or update the UI as needed
				} else if (data.error) {
					alert(data.error); // Display error message if there's an issue
				}
			})
			.catch(error => {
				console.error('Error:', error);
				alert('There was an error rejecting the friend request.');
			});
		});
	});

	});
	return $dashboard;
}