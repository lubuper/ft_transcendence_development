export default function Footer() {
	const $footer = document.createElement('footer')
	$footer.innerHTML = `
		<footer class="navbar navbar-expand-lg d-flex justify-content-between" style="background: transparent; position: fixed; bottom: 0; width: 100%;">
			<div class="d-flex">
				<button class="btn btn-purple btn-custom mx-1 nav-link text-white shadow-lg" data-path="/aboutus">About Us</button>
				<div class="dropup">
					<button class="btn btn-purple btn-custom dropdown-toggle mx-1 nav-link text-white shadow-lg me-3" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
						Language
					</button>
					<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
						<li><a class="dropdown-item" href="#" data-lang="en">English</a></li>
						<li><a class="dropdown-item" href="#" data-lang="fr">Français</a></li>
						<li><a class="dropdown-item" href="#" data-lang="es">Português</a></li>
					</ul>
				</div>
			</div>
		</footer>
	`
	return $footer
}