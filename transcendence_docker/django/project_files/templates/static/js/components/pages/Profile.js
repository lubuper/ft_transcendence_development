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
            // console.log(user)

            const profilePicHTML = user.profile_picture
                ? `<img src="${user.profile_picture}" alt="${user.username}'s profile picture" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;">`
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
                        <input type="text" class="form-control" id="username" name="username" value="${user.username}" readonly required>
                    </div>
                    <div class="form-group">
                        <label for="email" class="text-white">Email</label>
                        <input type="email" class="form-control" id="email" name="email" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password" class="text-white">New Password</label>
                        <input type="password" class="form-control" id="new-password" name="new-password">
                    </div>
                    <div class="form-group">
                        <label for="new-confirmPassword" class="text-white">Confirm New Password</label>
                        <input type="password" class="form-control" id="new-confirmPassword" name="new-confirmPassword">
                    </div>
                    <div class="form-group">
                        <label for="password" class="text-white">Insert your Password to confirm changes</label>
                        <input type="password" class="form-control" id="old-password" name="old-password" required>
                    </div>
                    <button type="submit" class="btn btn-purple btn-custom mt-3 text-white">Save</button>
                	<div id="message" class="text-white mt-3"></div>
                </form>
            </div>
            </div>
	        `;

            function validateImage(file) {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);

                    img.onload = () => {
                        URL.revokeObjectURL(img.src);
                        resolve(true);  // It's an image
                    };

                    img.onerror = () => {
                        URL.revokeObjectURL(img.src);
                        reject(false);  // Not an image
                    };
                });
            }

            const formP = $ProfileForm.querySelector('#profile-form');

            formP.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent default form submission

                console.log('aqui============')

                const form = document.getElementById('profile-form');

                const formPData = new FormData(form);

                const data = Object.fromEntries(formPData.entries());

                console.log('data: ', data)

                const profilePicture = formPData.get('profile-picture');

                if (profilePicture) {
                    // Perform basic image validation
                    try {
                        await validateImage(profilePicture);
                    } catch (error) {
                        alert("Please upload a valid image file.");
                        return;
                    }
                }


                try {
                    const response = await fetch('/update_profile/', {
                        method: 'POST',
                        headers: {
                            // 'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken') // For CSRF protection
                        },
                        body: formPData,
                    });

                    const messageDivP = document.getElementById('message');
                    messageDivP.innerText = '';  // Clear any previous messages
                    messageDivP.classList.remove('text-success', 'text-error');

                    const result = await response.json();

                    if (response.ok) {
                        messageDivP.innerText = 'Account updated successfully!';
                        //messageDiv.classList.add('text-success');  // not working
                        setTimeout(() => {
                            window.location.href = '/';  // era suposto ir para login page mas nao vai, so a home page funciona
                        }, 2000);
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
