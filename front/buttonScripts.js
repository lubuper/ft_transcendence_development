function loadLoginForm()
{
    fetch('/pages/login.html')
        .then(response => response.text())
        .then(html =>
		{
            document.getElementById('content_login').innerHTML = html;
        });
}