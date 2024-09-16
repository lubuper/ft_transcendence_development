export default function CreateAccount() {
	const $CreateAccountForm = document.createElement('CreateAccountForm')
	$CreateAccountForm.innerHTML = `
		<div class="vh-100 d-flex align-items-center justify-content-center position-relative">
			<div class="container row justify-content-center col-md-2">
				<form>
					<div class="form-group">
						<label for="username" class="text-white">Username</label>
						<input type="text" class="form-control" id="username" required>
					</div>
					<div class="form-group">
						<label for="email" class="text-white">Email</label>
						<input type="email" class="form-control" id="email" required>
					</div>
					<div class="form-group">
						<label for="password" class="text-white">Password</label>
						<input type="password" class="form-control" id="password" required>
					</div>
					<div class="form-group">
						<label for="confirmPassword" class="text-white">Confirm Password</label>
						<input type="password" class="form-control" id="confirmPassword" required>
					</div>
					<div class="form-group">
						<label for="captcha" class="text-white">Captcha</label>
						<input type="text" class="form-control" id="captcha" required>
					</div>
						<button type="submit" class="btn btn-purple btn-custom mt-3 text-white">Create Account</button>
				</form>
			</div>
		</div>
	`
	return $CreateAccountForm
}