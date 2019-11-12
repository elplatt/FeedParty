document.addEventListener('DOMContentLoaded', () => {

    // Config object holds account information
    var config = new FPConfig();

    // Find the DOM elements
    var serverInput = document.getElementById('mastodon-server');
    var emailInput = document.getElementById('mastodon-email');
    var passwordInput = document.getElementById('mastodon-password');
    var passwordContainer = document.getElementById('mastodon-password-container');
    var loginInput = document.getElementById('mastodon-login');
    var logoutInput = document.getElementById('mastodon-logout');
    var waitingMessage = document.getElementById('waiting');
    
    // Wait for background.js to load config, then request it
    chrome.runtime.sendMessage(
        {'contentScriptQuery': 'getConfig'},
        function (configJSON) {
            config.fromJSON(configJSON);
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
                passwordContainer.style.display = "none";
                logoutInput.style.display = "inline";
            }
        }
    );

    // Save new server and account when inputs are changed
    serverInput.addEventListener('change', () => {
        config.server_url = serverInput.value;
        chrome.runtime.sendMessage({
            'contentScriptQuery': 'saveConfig',
            'configJSON': config.toJSON()
        });
    });
    emailInput.addEventListener('change', () => {
        config.username = serverInput.username;
        chrome.runtime.sendMessage({
            'contentScriptQuery': 'saveConfig',
            'configJSON': config.toJSON()
        });
        config.saveUsername(emailInput.value);
    });
    
    // Handle login/logout requests
    loginInput.addEventListener('click', () => {
        var password = passwordInput.value;
        passwordInput.value = '';
        waitingMessage.style.display = "block";
        loginInput.style.display = "none";
        chrome.runtime.sendMessage({
            'contentScriptQuery': 'login',
            'password': password
        }, function (access_token) {
            waitingMessage.style.display = "none";
            if (typeof(access_token) == "undefined") {
                loginInput.style.display = "inline";
                logoutInput.style.display = "none";
                passwordContainer.style.display = "inline";
            } else {
                loginInput.style.display = "none";
                logoutInput.style.display = "inline";
                passwordContainer.style.display = "none";
            }
        });
    });
    logoutInput.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            'contentScriptQuery': 'logout'
        }, function (access_token) {
            if (access_token === null | typeof(access_token) == "undefined") {
                loginInput.style.display = "inline";
                passwordContainer.style.display = "inline";
                logoutInput.style.display = "none";
            } else {
                loginInput.style.display = "none";
                passwordContainer.style.display = "none";
                logoutInput.style.display = "inline";
            }
        });
    });
});

