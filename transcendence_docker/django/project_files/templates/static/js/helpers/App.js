import Header from '../components/Header.js';
import background from '../components/background.js'
import Footer from '../components/Footer.js';
import Home from '../components/pages/Home.js';
import CreateAccount from '../components/pages/CreateAccount.js';
import Login from '../components/pages/Login.js';
import DashBoard from '../components/pages/Dashboard.js';
import ErrorPage from '../components/pages/ErrorPage.js';
import AboutUs from '../components/pages/AboutUs.js';
import Asteroids from '../asteroids.js';
import Pong from '../pong.js';
import PongRemote from '../pongRemote.js';
import Profile from "../components/pages/Profile.js";
import ProfileFriend from "../components/pages/ProfileFriend.js";
import LocalPlay, { getSelectedGameMode, getSelectedGameType } from '../components/pages/LocalPlay.js';
import RemotePlay from "../components/pages/RemotePlay.js";
import GameLost from "../components/pages/GameLost.js";
import GameWon from "../components/pages/GameWon.js";

export default function App() {
	initSPA();
}

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
	'/localplay': () => LocalPlay(navigate),
	'/remoteplay': () => RemotePlay(navigate),
	'/error': ErrorPage,
	'/asteroids': Asteroids,
	'/pong': Pong,
	'/aboutus': AboutUs,
	'/profile': Profile,
	'/profileFriend': ProfileFriend,
	'/pongremote' : PongRemote,
	'/gamelost' : GameLost,
	'/gamewon' : GameWon
};

let currentGameI = null;
let gameIsActive = false;
let currentPath = null;

export function navigate(path) {
	console.log(`DEBUG: Navigating to: ${path}`);
	if (path === currentPath && path !== '/dashboard' && !document.getElementById('user-logged-in')) {
		refreshHeader();
		return;
	}
	currentPath = path;
	const allowedPaths = Object.keys(routes); // list of allowed paths for validation
	if (allowedPaths.includes(path)) {
		const existingCanvas = document.querySelector('canvas');
		if (existingCanvas) {
			if (currentGameI && typeof currentGameI.cleanup === 'function' && path !== '/asteroids' && path !== '/pong' && path !== '/pongremote') {
				currentGameI.cleanup();
			}
			if (existingCanvas.parentNode !== null) {
				existingCanvas.parentNode.removeChild(existingCanvas);
			}
		}
		const PageComponent = routes[path];
		$dynamic.innerHTML = '';
		if (PageComponent) {
			const gameMode = getSelectedGameMode();
			const gameType = getSelectedGameType();
			const page = PageComponent(gameMode, gameType);
			if (page instanceof HTMLElement) {
				$dynamic.appendChild(page);
			}
			if (path === '/asteroids' || path === '/pong') {
				currentGameI = page;
				gameIsActive = true;
			} else {
				if (gameIsActive && currentGameI && typeof currentGameI.cleanup === 'function') {
					currentGameI.cleanup(); // Call cleanup when leaving the game page
				}
				gameIsActive = false; // Reset the flag
				currentGameI = null;
			}
		}
		history.pushState({ path: path }, '', path);
		// Conditionally render the footer
		const $footer = document.querySelector('footer');
		const $header = document.querySelector('header');
		if (path === '/') {
			$header.remove();
			$root.appendChild(Header());
			if (!$footer) {
				$root.appendChild(Footer());
			}
		} else {
			if ($footer) {
				$footer.remove();
			}
		}
	}
	else {
		navigate('/error');
	}
}

function initSPA() {
	const initialPath = window.location.pathname;
	history.replaceState({ path: initialPath }, '', initialPath); // to set the initial browser to history state
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

	const videoMusicPlayer = background();
	document.body.appendChild(videoMusicPlayer);

	// Directly render the initial path if it's a game path
	if (initialPath === '/asteroids' || initialPath === '/pong') {
		const PageComponent = routes[initialPath];
		if (PageComponent) {
			const gameMode = getSelectedGameMode();
			const gameType = getSelectedGameType();
			const page = PageComponent(gameMode, gameType);
			if (page instanceof HTMLElement) {
				$dynamic.appendChild(page);
			}
			currentGameI = page;
			gameIsActive = true;
			currentPath = initialPath;
		}
	} else {
		navigate(initialPath);
	}
}

function refreshHeader() {
	const $header = document.querySelector('header');
	if ($header) {
		$header.remove();
	}
	$root.prepend(Header());
}