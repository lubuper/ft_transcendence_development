// const base = `
// 			<div class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
//                 <div class="card bg-dark text-white mb-3" style="width: 400px;">
//                 <div class="card-body text-center">
//                 <img src="/static/media/sadAlien.jpg"
//                      alt="Sad Alien"
//                      style="width: 300px; height: 300px; border-radius: 10px; margin-bottom: 20px;">
//                 <h5 class="card-title">Some error happened</h5>
//                 </div>
//                 </div>
//             </div>
// 			`;
//
// function getCSRFToken() {
// 	const name = 'csrftoken';
// 	const cookies = document.cookie.split(';');
// 	for (let cookie of cookies) {
// 		const trimmedCookie = cookie.trim();
// 		if (trimmedCookie.startsWith(name + '=')) {
// 			return decodeURIComponent(trimmedCookie.substring(name.length + 1));
// 		}
// 	}
// 	return null;
// }

export default function RemotePlay(navigate) {
	const $remotePong = document.createElement('div');
		$remotePong.innerHTML = `
		<div class="vh-100 d-flex flex-column align-items-center justify-content-center position-relative">
			<div class="card bg-dark text-white mb-3" style="width: 400px;">
				<div class="card-body text-center">
				<img src="/static/media/esperando.jpg" 
						alt="Waiting Alien" 
						style="width: 300px; height: 300px; border-radius: 10px; margin-bottom: 20px;">
				<h5 class="card-title">lets go</h5>
				</div>
				</div>
		</div>
	`;

	// const gameId = '123';
	// const socket = new WebSocket(`ws://${window.location.host}/ws/game/${gameId}/`);
	//
	// // Handle incoming messages
	// socket.onmessage = function(event) {
	// 	const data = JSON.parse(event.data);
	//
	// 	if (data.type === 'player_joined') {
	// 		console.log(data.message);
	// 	}
	//
	// 	if (data.type === 'start_game') {
	// 		console.log(data.message);
	// 		navigate('/playpong');
	// 	}
	// };
	//
	// socket.onopen = function() {
	// 	console.log('WebSocket connection established.');
	// };
	//
	// socket.onclose = function(event) {
	// 	console.log('WebSocket connection closed.');
	// };

	return $remotePong;
}