export default function Profile() {
    const $ProfileForm = document.createElement('profile');

    const base = `
		<h1>You are not logged yet!</h1>
	`

    $ProfileForm.innerHTML = base;

    fetch('/profile/')
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            const user = await response.json();
            console.log(user)

            // Apply cache busting to ensure the latest image is fetched
            const profilePicURL = `static/${user.profile_picture}`
                // ? `static/${user.profile_picture}?${new Date().getTime()}`
                // : 'static/media/profile_pics/default_profile.jpg'; // Path to default image

            const profilePicHTML = user.profile_picture
                ? `<img src="${profilePicURL}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;">`
                : '<div>No profile picture available</div>';

            $ProfileForm.innerHTML = `
			<div class="vh-100 d-flex align-items-center justify-content-center position-relative">
            <div class="container row justify-content-center col-md-2">
                ${profilePicHTML}
                <form id="profile-form" enctype="multipart/form-data">
                    <div class="form-group">
                         <label for="profile-picture" class="text-white">Profile Picture</label>
                         <input type="file" class="form-control" id="profile-picture" name="profile-picture" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label for="username" class="text-white">Username</label>
                        <input type="text" class="form-control" id="username" name="username" value="${user.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="email" class="text-white">Email</label>
                        <input type="email" class="form-control" id="email" name="email" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="password" class="text-white">Password</label>
                        <input type="password" class="form-control" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password" class="text-white">New Password</label>
                        <input type="password" class="form-control" id="new-password" name="new-password">
                    </div>
                    <div class="form-group">
                        <label for="new-confirmPassword" class="text-white">Confirm New Password</label>
                        <input type="password" class="form-control" id="new-confirmPassword" name="new-confirmPassword">
                    </div>
                    <button type="submit" class="btn btn-purple btn-custom mt-3 text-white">Save</button>
                	<div id="message" class="text-white mt-3"></div>
                </form>
            </div>
            </div>
	        `;

            const formP = $ProfileForm.querySelector('#profile-form');

            formP.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent default form submission

                const formPData = new FormData(formP);

                const data = Object.fromEntries(formPData.entries());

                try {
                    const response = await fetch('/update_profile/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken') // For CSRF protection
                        },
                        body: JSON.stringify(data)
                    });

                    const messageDivP = document.getElementById('message');
                    messageDivP.innerText = '';  // Clear any previous messages
                    messageDivP.classList.remove('text-success', 'text-error');

                    const result = await response.json();

                    if (response.ok) {
                        messageDivP.innerText = 'Account updated successfully!';
                        //messageDiv.classList.add('text-success');  // not working
                        /*setTimeout(() => {
                            window.location.href = '/';  // era suposto ir para login page mas nao vai, so a home page funciona
                        }, 2000);*/
                    } else {
                        messageDivP.innerText = 'Failed to update account: ' + (result.message || 'Unknown error');
                        //messageDiv.classList.add('text-error');  // not working
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            });

        })
        .catch((error) => {
            console.log("error", error)
            $ProfileForm.innerHTML = `
			${base}
			`
        })

    return $ProfileForm;
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
