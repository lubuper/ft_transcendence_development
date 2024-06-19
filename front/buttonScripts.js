function loadLoginForm()
{
    fetch('/front/pages/login.html')
        .then(response => response.text())
        .then(html =>
		{
            document.getElementById('content_login').innerHTML = html;
        });
}
