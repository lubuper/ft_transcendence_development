import App, { navigate } from '../../helpers/App.js';

export default function CreateAccount() {
	const $CreateAccountForm = document.createElement('CreateAccountForm');
	$CreateAccountForm.innerHTML = `
        <div class="vh-100 d-flex align-items-center justify-content-center position-relative">
            <div class="container row justify-content-center col-md-2">
                <form id="create-account-form">
                    <div class="form-group">
                        <label for="username" class="text-white">Username</label>
                        <input type="text" class="form-control" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email" class="text-white">Email</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password" class="text-white">Password</label>
                        <input type="password" class="form-control" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword" class="text-white">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
                    </div>
<!--                    <div class="form-group">-->
<!--                        <label for="captcha" class="text-white">Captcha</label>-->
<!--                        <input type="text" class="form-control" id="captcha" name="captcha" required>-->
<!--                    </div>-->
                    <button type="submit" class="btn btn-purple btn-custom mt-3 text-white">Create Account</button>
                	<div id="message" class="text-white mt-3"></div>
                </form>
            </div>
        </div>
    `;

	const form = $CreateAccountForm.querySelector('#create-account-form');

	form.addEventListener('submit', async (event) => {
		event.preventDefault(); // Prevent default form submission

		const formData = new FormData(form);

		const data = Object.fromEntries(formData.entries());

		try {
			const response = await fetch('/create-account/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': getCookie('csrftoken') // For CSRF protection
				},
				body: JSON.stringify(data)
			});

			const messageDiv = document.getElementById('message');
			messageDiv.innerText = '';  // Clear any previous messages
			messageDiv.classList.remove('text-success', 'text-error');

			const result = await response.json();

			if (response.ok) {
				messageDiv.innerText = 'Account created successfully!';
				messageDiv.classList.add('text-success');  // not working
				setTimeout(() => {
					navigate('/login');
				}, 1000);
			} else {
				messageDiv.innerText = 'Failed to create account: ' + (result.message || 'Unknown error');
				messageDiv.classList.add('text-error');  // not working
			}
		} catch (error) {
			console.error('Error:', error);
		}
	});

	return $CreateAccountForm;
}

// Helper function to get the CSRF token from cookies
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}