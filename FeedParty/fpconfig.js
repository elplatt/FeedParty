/**
 *
 */
var FPConfig = function () {};
window.FPConfig = FPConfig;
FPConfig.prototype = {
    client_name: "FeedParty",
    scopes: "read write follow",
    website: "",
    load: function () {
        var config = this;
        return (
            this._loadFromStorage('server_url')
            .then(() => config._loadFromStorage('username'))
            .then(() => config._loadFromStorage(config.server_url + ':client_id'))
            .then(() => config._loadFromStorage(config.server_url + ':client_secret'))
            .then(() => config._loadFromStorage('access_token'))
            .then(() => {
                // Check if the app has been registered already
                var client_id = config[config.server_url + ':client_id'];
                var client_secret = config[config.server_url + ':client_secret'];
                if (typeof(client_id) == "undefined" || typeof(client_secret) == "undefined") {
                    // The app has not been registered, register through API
                    return Mastodon.OAuth.register(
                        config.server_url, config.client_name, config.scopes, config.website
                    ).then((data) => {
                        var prefix = config.server_url + ':';
                        var items = {};
                        items[prefix + "client_id"] = data.client_id;
                        items[prefix + "client_secret"] = data.client_secret;
                        return config._saveToStorage(items);
                    });
                } else {
                    return new Promise(function (resolve) { resolve(); });
                }
            })
        );
    },
    // Log in using previously registered app, username, and password
    logIn: function (password) {
        var config = this;
        return Mastodon.OAuth.getToken(
            config.server_url,
            config[config.server_url + ':client_id'],
            config[config.server_url + ':client_secret'],
            config.username,
            password
        ).then((data) => {
            config.access_token = data.access_token;
            var items = {};
            items.access_token = data.access_token;
            return config._saveToStorage(items);
        });
    },
    logOut: function () {
        return config._removeFromStorage(['access_token']);
    },
    // Get a value from chrome storage and store it as an attribute
    _loadFromStorage: function (key) {
        var config = this;
        // Create a promise to wrap the chrome storage request
        return new Promise(function (resolve, reject) {
            // See: https://developer.chrome.com/apps/storage#type-StorageArea
            chrome.storage.local.get(key, (items) => {
                if (chrome.runtime.lastError) {
                    reject();
                } else {
                    config[key] = items[key];
                    resolve(config[key]);
                }
            });
        });        
    },
    _saveToStorage: function (items) {
        var config = this;
        return new Promise(function (resolve) {
            chrome.storage.local.set(
                items,
                () => {
                    // Values stores successfully
                    for (var key in items) {
                        if (items.hasOwnProperty(key)) {
                            config[key] = items[key];
                        }
                    }
                    resolve();
                }
            );
        });
    },
    _removeFromStorage: function(items) {
        var config = this;
        return new Promise(function (resolve) {
            chrome.storage.local.remove(items, () => {
                for (var i = 0; i < items.length; i++) {
                    delete config[items[i]];
                }
                resolve();
            });
        });
    },
    saveServerUrl: function (url) {
        var config = this;
        var items = { "server_url": url };
        chrome.storage.local.set(items, () => {
            config.server_url = url;
            config.load();
        });
    },
    saveUsername: function (username) {
        var config = this;
        var items = { "username": username };
        chrome.storage.local.set(items, () => {
            config.username = username;
            config.load();
        });
    }
};