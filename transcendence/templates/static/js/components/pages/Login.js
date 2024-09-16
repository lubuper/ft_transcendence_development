export default function Login() {
	const $loginForm = document.createElement('loginForm')
	$loginForm.innerHTML = `
		<div class="vh-100 d-flex align-items-center justify-content-center position-relative">
			<div class="container row justify-content-center col-md-2">
				<form>
					<div class="form-group">
						<label for="username" class="text-white">Username</label>
						<input type="text" class="form-control" id="username" required>
					</div>
					<div class="form-group">
						<label for="password" class="text-white">Password</label>
						<input type="password" class="form-control" id="password" required>
					</div>
					<button type="submit" class="btn btn-purple btn-custom mt-3 text-white">Login</button>
				</form>
			</div>
		</div>
	`;
	return $loginForm
}