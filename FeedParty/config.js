var config = new FPConfig();
document.addEventListener('DOMContentLoaded', () => {

    // Find the DOM elements
    var serverInput = document.getElementById('mastodon-server');
    var emailInput = document.getElementById('mastodon-email');
    var passwordInput = document.getElementById('mastodon-password');
    var loginInput = document.getElementById('mastodon-login');
    var logoutInput = document.getElementById('mastodon-logout');
    
    //var config = new FPConfig();
    config.load().then(() => {
        // Update DOM elements with configuration from storage
        if (typeof(config.server_url) != "undefined") {
            serverInput.value = config.server_url;
        }
        if (typeof(config.username) != "undefined") {
            emailInput.value = config.username;
        }
        if (typeof(config.access_token) == "undefined") {
            loginInput.style.display = "inline";
            logoutInput.style.display = "none";
        } else {
            loginInput.style.display = "none";
            logoutInput.style.display = "inline";
        }
    });

    // Save new server and account when inputs are changed
    serverInput.addEventListener('change', () => {
        config.saveServerUrl(serverInput.value);
    });
    emailInput.addEventListener('change', () => {
        config.saveUsername(emailInput.value);
    });
    
    // Handle login/logout requests
    loginInput.addEventListener('click', () => {
        config.logIn(passwordInput.value).then(() => {
            if (typeof(config.access_token) == "undefined") {
                loginInput.style.display = "inline";
                logoutInput.style.display = "none";
            } else {
                loginInput.style.display = "none";
                logoutInput.style.display = "inline";
            }
        });
    });
    logoutInput.addEventListener('click', () => {
        config.logOut().then(() => {
            if (typeof(config.access_token) == "undefined") {
                loginInput.style.display = "inline";
                logoutInput.style.display = "none";
            } else {
                loginInput.style.display = "none";
                logoutInput.style.display = "inline";
            }
        });
    });
    
});

