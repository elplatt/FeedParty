
// The config object holds account/credential information and is defined in fpconfig.js
var config = new FPConfig();
config.load();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == 'getConfig') {
            // Reload config to make sure data is up to date
            config.load();
            // Send response asynchronously after config is loaded
            config.loaded.then(function () {
                sendResponse(config.toJSON());
            });
        } else if (request.contentScriptQuery == 'loadTimeline') {
            var timelineUrl = "https://" + config.server_url + "/api/v1/timelines/home";
            var req = new XMLHttpRequest();
            req.addEventListener("load", function () {
                sendResponse(req.responseText);
            });
            req.open("GET", timelineUrl + "?access_token=" + config.access_token);
            req.send();
        } else if (request.contentScriptQuery == 'saveConfig') {
            config.fromJSON(request.configJSON);
            config.save();
        } else if (request.contentScriptQuery == 'login') {
            config.load().then(function () {
                config.logIn(request.password).then(function () {
                    sendResponse(config.access_token);
                });
            });
        } else if (request.contentScriptQuery == 'logout') {
            config.logOut().then(function () {
                sendResponse(config.access_token);
            });
        }
        return true;
    }
);