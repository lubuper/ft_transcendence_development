import { currentFriend } from './Dashboard.js';

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
            const pongRank = calculateRankedStats2(userFriend.match_history, "Pong")
            const astRank = calculateRankedStats2(userFriend.match_history, "Asteroids")
            $ProfileFriendForm.innerHTML = `
			<div class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative" style="background-color: rgba(0, 0, 0, 0.6); color: white;">
                <div class="card bg-dark text-white mb-3" style="width: 400px;">
                <div class="card-body text-center">
                <img id="avatar" src="static/${userFriend.profile_picture}"
                     class="rounded-circle mb-3" 
                     alt="Avatar" 
                     style="width: 100px; height: 100px;">
                <h5 class="card-title">${currentFriend}</h5>
                <p class="card-text">
                    <img src="/static/media/rank/${pongRank.rank}.png" 
                     alt="${pongRank.rank}" 
                     style="width: 64px; height: 64px; margin-right: 2px;">
                    ${pongRank.result}
                </p>
                <p class="card-text">
                    <img src="/static/media/rank/${astRank.rank}.png" 
                     alt="${astRank.rank}" 
                     style="width: 64px; height: 64px; margin-right: 2px;">
                    ${astRank.result}
                </p>
                </div>
                </div>
                <button class="btn btn-danger btn-lg text-white shadow-lg mt-3 custom-button">Block</button>
                <button class="btn btn-purple btn-lg text-white shadow-lg mt-3 custom-button" onclick="window.history.back()">Go Back To Dashboard</button>
            </div>
	        `;

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