export default function Home() {
	const $home = document.createElement('home')
	$home.innerHTML = `
		<button id="playvsaibutton" class="btn btn-purple btn-lg mx-5 nav-link text-white shadow-lg" data-path="/playvsai">Play VS AI</button>
	`
	return $home
}