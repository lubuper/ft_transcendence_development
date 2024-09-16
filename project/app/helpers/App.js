import Header from '../components/Header.js'
import Footer from '../components/Footer.js'
import Home from '../components/pages/Home.js'
import PlayVsAI from '../components/pages/PlayVSAI.js'
import CreateAccount from '../components/pages/CreateAccount.js';
import Login from '../components/pages/Login.js';
import DashBoard from '../components/pages/Dashboard.js';
import ErrorPage from '../components/pages/ErrorPage.js';
import AboutUs from '../components/pages/AboutUs.js';
import Asteroids from '../asteroids.js';
import Pong from '../pong.js';

export default function App() {
	const $root = document.getElementById('content-static');
	const $dynamic = document.getElementById('content-dynamic');
	$root.appendChild(Header());
	$dynamic.appendChild(Home());
	$root.appendChild(Footer());

	const routes = {
		'/': Home,
		'/login': Login,
		'/dashboard': DashBoard,
		'/createaccount': CreateAccount,
		'/playvsai': PlayVsAI,
		'/error': ErrorPage,
		'/asteroids': Asteroids,
		'/pong': Pong,
		'/aboutus': AboutUs
	};
	
	function navigate(path) {
		const allowedPaths = Object.keys(routes); // list of allowed paths for validation
		if (allowedPaths.includes(path)) {
			const existingCanvas = document.querySelector('canvas');
			if (existingCanvas) {
				existingCanvas.parentNode.removeChild(existingCanvas);
				// I would add something like cleanUp() here
			}
			document.getElementById('gameOver').style.display = 'none';
			document.getElementById('gameWin').style.display = 'none';
			const page = routes[path](); // This might return undefined
			$dynamic.innerHTML = ''; // Clear the current page
			if (page instanceof HTMLElement) { 	// Only append if page is a DOM element
				$dynamic.appendChild(page);
			}	
			history.pushState({ path: path }, '', path);
		} else { // Redirect to the error page if the path is not allowed
			navigate('/error');
		}		
	}

	function initSPA() {
		history.replaceState({ path: '/' }, '', '/'); // to set the initial browser to history state
		window.addEventListener('popstate', function(event) {
			if (event.state && event.state.path && routes[event.state.path]) {
				navigate(event.state.path);
			}
		});

		document.addEventListener('click', function(event) {
			if (event.target.matches('[data-path]')) {
				event.preventDefault();
				const path = event.target.getAttribute('data-path');
				navigate(path);
			}
		});
	}

	initSPA();
}