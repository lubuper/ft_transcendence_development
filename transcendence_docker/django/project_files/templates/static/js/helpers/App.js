import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Home from '../components/pages/Home.js';
import CreateAccount from '../components/pages/CreateAccount.js';
import Login from '../components/pages/Login.js';
import DashBoard from '../components/pages/Dashboard.js';
import ErrorPage from '../components/pages/ErrorPage.js';
import AboutUs from '../components/pages/AboutUs.js';
import Asteroids from '../asteroids.js';
import Pong from '../pong.js';
import Profile from "../components/pages/Profile.js";
import LocalPlay, { getSelectedGameMode } from '../components/pages/LocalPlay.js';

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
        '/localplay': () => LocalPlay(navigate),
        '/error': ErrorPage,
        '/asteroids': Asteroids,
        '/pong': Pong,
        '/aboutus': AboutUs,
        '/profile': Profile
    };
    
    let currentGameI = null;

    function navigate(path) {
        const allowedPaths = Object.keys(routes); // list of allowed paths for validation
        if (allowedPaths.includes(path)) {
            const existingCanvas = document.querySelector('canvas');
            if (existingCanvas) {
                if (currentGameI && typeof currentGameI.cleanup === 'function') {
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
                const page = PageComponent(gameMode);
                if (page instanceof HTMLElement) {
                    $dynamic.appendChild(page);
                }
                if (path === '/asteroids' || path === '/pong') {
                    currentGameI = page;
                } else {
                    currentGameI = null;
                }
            }
            history.pushState({ path: path }, '', path);
            // Conditionally render the footer
            const $footer = document.querySelector('footer');
            if (path === '/') {
                if (!$footer) {
                    $root.appendChild(Footer());
                }
            } else {
                if ($footer) {
                    $footer.remove();
                }
            }
        } else {
            // Redirect to the error page if the path is not allowed
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