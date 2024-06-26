document.getElementById('ft_transcendence').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/front/index.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('content_home').innerHTML = html;
            history.pushState({html: html}, '', '/front/index.html');
        });
});

window.addEventListener('popstate', function(event) {
    if (event.state) {
        document.getElementById('content_home').innerHTML = event.state.html;
    }
});

window.addEventListener('load', function() {
    document.body.classList.add('show');
});

function loadPage(url) {
    document.body.classList.remove('show');
    setTimeout(function () {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                document.getElementById('content_home').innerHTML = html;
                history.pushState({html: html}, '', url);
                document.body.classList.add('show');
            });
    }, 500);
}


//REPLACEMENT CODE FOR SANITIZING THE HTML STRINGS TO PREVENT VULNERABILITIES. DO NOT FORGET TO INSTALL DOMPURIFY LIB
/* import DOMPurify from 'dompurify';

document.getElementById('ft_transcendence').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/front/index.html')
        .then(response => response.text())
        .then(html => {
            const cleanHTML = DOMPurify.sanitize(html);
            document.getElementById('content_home').innerHTML = cleanHTML;
            history.pushState({html: cleanHTML}, '', '/front/index.html');
        });
});

window.addEventListener('popstate', function(event) {
    if (event.state) {
        const cleanHTML = DOMPurify.sanitize(event.state.html);
        document.getElementById('content_home').innerHTML = cleanHTML;
    }
});

function loadLoginForm() {
    fetch('/front/pages/login.html')
        .then(response => response.text())
        .then(html => {
            const cleanHTML = DOMPurify.sanitize(html);
            document.getElementById('content_home').innerHTML = cleanHTML;
            history.pushState({html: cleanHTML}, '', '/front/pages/login.html');
        });
} */