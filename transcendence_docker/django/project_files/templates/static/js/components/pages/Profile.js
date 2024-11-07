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
                ? `<img src="${user.profile_picture}" alt="${user.username}'s profile picture" 
                     class="rounded-circle mb-3" 
                     alt="Avatar" 
                     style="width: 200px; height: 200px;">`
                : '<div>No profile picture available</div>';

            $ProfileForm.innerHTML = `
			<div class="d-flex align-items-center justify-content-center position-relative">
            <div class="container row justify-content-center col-md-2">
                <form id="profile-form" enctype="multipart/form-data">
                    <div class="form-group">
                        <label class="text-white">Profile Picture</label>
                        ${profilePicHTML}
                    </div>
                    <div class="form-group">
                        <label class="text-white">Upload New Profile Picture</label>
                        <div class="profile-photo-div" id="profile-photo-div">
                        <div class="profile-img-div" id="profile-img-div">
                        <div id="loader"></div><img id="profile-img" src="https://s3.amazonaws.com/FringeBucket/default-user.png" /><input id="x-position" type="range" name="x-position" value="0" min="0" /><input id="y-position" type="range" name="y-position" value="0" min="0" /></div>
                        <div
                            class="profile-buttons-div">
                        <div class="profile-img-input" id="profile-img-input"><label class="button" id="change-photo-label" for="change-photo">UPLOAD PHOTO</label><input id="change-photo" name="change-photo" type="file" style="display: none" accept="image/*" /></div>
                        <div class="profile-img-confirm" id="profile-img-confirm"
                            style="display: none">
                        <div class="button half green" id="save-img"><i class="fa fa-check" aria-hidden="true"></i></div>
                        <div class="button half red" id="cancel-img"><i class="fa fa-remove" aria-hidden="true"></i></div>
                        </div>
                        </div>
                        </div>
                    </div>
                    <div class="error" id="error">min sizes 400*400px</div><canvas id="croppedPhoto" width="400" height="400"></canvas>
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

        let $profileImgDiv = document.getElementById("profile-img-div"),
                $profileImg = document.getElementById("profile-img"),
                $changePhoto = document.getElementById("change-photo"),
                $xPosition = document.getElementById("x-position"),
                $yPosition = document.getElementById("y-position"),
                $saveImg = document.getElementById("save-img"),
                $loader = document.getElementById("loader"),
                $cancelImg = document.getElementById("cancel-img"),
                $profileImgInput = document
                    .getElementById("profile-img-input"),
                $profileImgConfirm = document
                    .getElementById("profile-img-confirm"),
                $error = document.getElementById("error");

            let currentProfileImg = ""
            let profileImgDivW = getSizes($profileImgDiv).elW
            let NewImgNatWidth = 0
            let NewImgNatHeight = 0
            let NewImgNatRatio = 0
            let NewImgWidth = 0
            let NewImgHeight = 0
            let NewImgRatio = 0
            let xCut = 0
            let yCut = 0

            makeSquared($profileImgDiv);

            $changePhoto.addEventListener("change", function() {
                currentProfileImg = $profileImg.src;
                showPreview(this, $profileImg);
                $loader.style.width = "100%";
                $profileImgInput.style.display = "none";
                $profileImgConfirm.style.display = "flex";
                $error.style.display = "none";
            });

            $xPosition.addEventListener("input", function() {
                $profileImg.style.left = -this.value + "px";
                xCut = this.value;
                yCut = 0;
            });

            $yPosition.addEventListener("input", function() {
                $profileImg.style.top = -this.value + "px";
                yCut = this.value;
                xCut = 0;
            });

            $saveImg.addEventListener("click", function() {
                cropImg($profileImg);
                resetAll(true);
            });

            $cancelImg.addEventListener("click", function() {
                resetAll(false);
            });

            window.addEventListener("resize", function() {
                makeSquared($profileImgDiv);
                profileImgDivW = getSizes($profileImgDiv).elW;
            });

            function makeSquared(el) {
                let elW = el.clientWidth;
                el.style.height = elW + "px";
            }

            function showPreview(input, el) {
                var reader = new FileReader();
                reader.readAsDataURL(input.files[0]);
                if (input.files && input.files[0]) {
                    reader.onload = function(e) {
                        setTimeout(function() {
                            el.src = e.target.result;
                        }, 300);

                        let poll = setInterval(function() {
                            if (el.naturalWidth && el.src != currentProfileImg) {
                                clearInterval(poll);
                                setNewImgSizes(el);
                                setTimeout(function() {
                                    $loader.style.width = "0%";
                                    $profileImg.style.opacity = "1";
                                }, 1000);
                            }
                        }, 100);
                    };
                } else {
                    return;
                }
            }

            function setNewImgSizes(el) {
                if (getNatSizes(el).elR > 1) {
                    el.style.width = "auto";
                    el.style.height = "100%";
                    NewImgNatWidth = getSizes(el).elW;
                    $xPosition.style.display = "block";
                    $yPosition.style.display = "none";
                    $xPosition.max = NewImgNatWidth - profileImgDivW;
                } else if (getNatSizes(el).elR < 1) {
                    el.style.width = "100%";
                    el.style.height = "auto";
                    NewImgNatHeight = getSizes(el).elH;
                    $xPosition.style.display = "none";
                    $yPosition.style.display = "block";
                    $yPosition.max = NewImgNatHeight - profileImgDivW;
                } else if (getNatSizes(el).elR == 1) {
                    el.style.width = "100%";
                    el.style.height = "100%";
                    $xPosition.style.display = "none";
                    $yPosition.style.display = "none";
                }
            }

            function getNatSizes(el) {
                let elW = el.naturalWidth,
                    elH = el.naturalHeight,
                    elR = elW / elH;
                return {
                    elW: elW,
                    elH: elH,
                    elR: elR
                };
            }

            function getSizes(el) {
                let elW = el.clientWidth,
                    elH = el.clientHeight,
                    elR = elW / elH;
                return {
                    elW: elW,
                    elH: elH,
                    elR: elR
                };
            }

            function cropImg(el) {
                let natClientImgRatio = getNatSizes(el).elW / getSizes(el).elW;
                (myCanvas = document.getElementById("croppedPhoto")),
                    (ctx = myCanvas.getContext("2d"));
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 400, 400);
                ctx.drawImage(
                    el,
                    xCut * natClientImgRatio,
                    yCut * natClientImgRatio,
                    profileImgDivW * natClientImgRatio,
                    profileImgDivW * natClientImgRatio,
                    0,
                    0,
                    400,
                    400
                );
                let newProfileImgUrl = myCanvas.toDataURL("image/jpeg");
                $profileImg.src = newProfileImgUrl;
            }

            function resetAll(confirm) {
                if (!confirm) {
                    $profileImg.src = currentProfileImg;
                }
                $changePhoto.value = "";
                $profileImgInput.style.display = "block";
                $profileImgConfirm.style.display = "none";
                $profileImg.style.left = "0";
                $profileImg.style.top = "0";
                $profileImg.style.width = "100%";
                $profileImg.style.height = "100%";
                $xPosition.style.display = "none";
                $yPosition.style.display = "none";
                $xPosition.value = "0";
                $yPosition.value = "0";
                xCut = "0";
                yCut = "0";
            }

            function checkMinSizes(el) {
                if (getNatSizes(el).elW > 400 && getNatSizes(el).elH > 400) {
                    return true;
                } else {
                    return false;
                }
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
                    if (!croppedImageBlob) {
                        alert("Please select and crop an image first.");
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
