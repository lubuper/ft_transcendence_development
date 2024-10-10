let selectedGameMode = null;

export default function LocalPlay(navigate) {
    const $games = document.createElement('div');
    $games.innerHTML = `
        <div class="vh-100 d-flex align-items-center justify-content-center position-relative">
            <div class="d-flex flex-column align-items-center">
                <div class="card mb-3 bg-dark text-white" style="width: 18rem; border: 1px solid #343a40;">
                    <div class="card-body">
                        <h5 class="card-title text-center">Select Game Mode</h5>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="gameMode" id="hotseat" value="2" checked>
                            <label class="form-check-label" for="hotseat">Hotseat session</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="gameMode" id="ai" value="1">
                            <label class="form-check-label" for="ai">Play vs AI</label>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-center mt-4">
                    <button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/pong">Pong</button>
                    <button class="btn btn-purple btn-lg mx-5 text-white shadow-lg" data-path="/asteroids">Asteroids</button>
                </div>
            </div>
        </div>
    `;

    $games.addEventListener('click', (event) => {
        if (event.target.matches('[data-path]')) {
            event.preventDefault();
            const path = event.target.getAttribute('data-path');
            selectedGameMode = document.querySelector('input[name="gameMode"]:checked').value;
            navigate(path);
        }
    });

    return $games;
}

export function getSelectedGameMode() {
    return selectedGameMode;
}