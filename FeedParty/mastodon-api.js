var Mastodon = function (token) {
    this.token = token;
};
window.Mastodon = Mastodon;
Mastodon.prototype = {
}
Mastodon.OAuth = {
    register: function (server, client_name, scopes, website) {
        var url = "https://" + server + "/api/v1/apps";
        var redirect_uris = "urn:ietf:wg:oauth:2.0:oob";
        
        // Construct POST data
        var form = new FormData();
        form.append("client_name", client_name);
        form.append("redirect_uris", redirect_uris);
        form.append("scopes", scopes);
        form.append("website", website);
        
        // Make the API call
        var p = fetch(url, {
            method: "POST",
            body: form
        }).then((response) => {
            // Parse the response
            return response.json();
        });
        
        // Return a promise that resolves to the response data
        return p;
    },
    getToken: function (server, client_id, client_secret, username, password) {
        var url = "https://" + server + "/oauth/token";
        
        // Construct POST data
        var form = new FormData();
        form.append("client_id", client_id);
        form.append("client_secret", client_secret);
        form.append("grant_type", "password");
        form.append("username", username);
        form.append("password", password);
        
        // Make the API call
        var p = fetch(url, {
            method: "POST",
            body: form
        }).then((response) => {
            // Parse the response
            return response.json();
        });
        
        // Return a promise that resolves to the response data
        return p;
    },
};


