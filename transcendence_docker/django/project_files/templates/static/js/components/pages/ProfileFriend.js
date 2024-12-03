import { currentFriend } from './Dashboard.js';
import {navigate} from "../../helpers/App.js";

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

console.log('friend que chega na pagina', currentFriend);
export default function ProfileFriend() {
    const $ProfileFriendForm = document.createElement('profileFriend');

    const base = `
		<h1>You have no friends!</h1>
	`

    $ProfileFriendForm.innerHTML = base;

    fetch('/get-profile-friend/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username: currentFriend })
    })
        .then( async response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const userFriend = await response.json();
            const pongRank = calculateRankedStats2(userFriend.match_history, "Pong Remote")
            const astRank = calculateRankedStats2(userFriend.match_history, "Asteroids Remote")
            $ProfileFriendForm.innerHTML = `
            <div class="vh-100 d-flex align-items-center justify-content-start position-relative">
			<div class="container mt-3 col-md-3">
					<div class="card bg-dark text-white mb-3">
							<div class="card-body text-center">
								<img id="avatar" src="${userFriend.profile_picture}"
                                    class="rounded-circle mb-3"
                                    alt="Avatar"
                                    style="width: 100px; height: 100px;">
								<h5 class="card-title">${currentFriend}</h5>
								<p class="card-text">
									<img src="/static/media/rank/${pongRank.rank}.png"
										alt="${pongRank.rank}"
										style="width: 64px; height: 64px; margin-right: 2px;">
									${pongRank.result}
									<span class="tooltiptext">The game ranking starts after 5 remote matches, Good luck!</span>
								</p>
								<p class="card-text">
									<img src="/static/media/rank/${astRank.rank}.png"
										alt="${astRank.rank}"
										style="width: 64px; height: 64px; margin-right: 2px;">
									${astRank.result}
									<span class="tooltiptext">The game ranking starts after 5 remote matches, Good luck!</span>
								</p>
							</div>
						</div>
						<div class="card bg-dark text-white mb-3">
							<div class="card-header">
								<button class="btn btn-link text-white" type="button" data-bs-toggle="collapse" data-bs-target="#matchHistoryCollapse" aria-expanded="false" aria-controls="matchHistoryCollapse">
									Match History
								</button>
							</div>
							<div id="matchHistoryCollapse" class="collapse">
								<div class="card-body">
									${userFriend.match_history
                                        .filter(match => !match.game.includes('Tournament'))
                                        .map(match => `
										<p>
												${match.game}: ${match.score} ->
											<span style="color: ${match.result === 'Win' ? 'green' : 'red'};">
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
                    <button id="RemoveFriend-${currentFriend}" class="btn btn-danger btn-lg text-white shadow-lg mt-3 custom-button w-100">Remove Friend</button>
                    <div class="card-body" id="friend-request-message"></div>
                    <button class="btn btn-purple btn-lg text-white shadow-lg mt-3 custom-button w-100" onclick="window.history.back()">Go Back To Dashboard</button>
			</div>
		</div>
	        `;

            document.getElementById(`RemoveFriend-${currentFriend}`).addEventListener('click', async function() {
                const response = await fetch('/remove_friend/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken() // Ensure CSRF token is sent
                    },
                    body: JSON.stringify({
                        'username': currentFriend // Send the username in the request body
                    }),
                })
                const result = await response.json();
                const friendRejectMessage = document.getElementById('friend-request-message');

                if (response.ok) {
                    friendRejectMessage.innerHTML = '<p class="text-success">Friend removed successfully!</p>';
                    setTimeout(() => {
                        friendRejectMessage.innerHTML = '<p </p>';
                        navigate('/dashboard');
                    }, 1000);
                } else {
                    friendRejectMessage.innerHTML = `<p class="text-danger">Failed to remove friend! ${result.message} </p>`;
                    setTimeout(() => {
                        friendRejectMessage.innerHTML = '<p </p>';
                    }, 1000);
                }
            });

            function calculateRankedStats2(matchHistory, gameName) {
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

        })
        .catch(error => {
            console.error('Error:', error);
            $ProfileFriendForm.innerHTML = `
			${base}
			`
        });

    return $ProfileFriendForm;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie string begins with the name we want
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
