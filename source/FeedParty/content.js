/**
 * Main script (called from bottom of file).
 */
var onPageLoad = function () {
    var config = new FPConfig();
    config.load().then(() => {
        if (typeof(config.access_token) != "undefined") {
            var timelineUrl = "https://" + config.server_url + "/api/v1/timelines/home";
            var req = new XMLHttpRequest();
            req.addEventListener("load", onTimelineLoad);
            req.open("GET", timelineUrl + "?access_token=" + config.access_token);
            req.send();
        }
    });
};    

/**
 * Build a DOM element from data for a single toot from the mastodon API.
 */
var buildItem = function (toot) {
    
    // Extract relevant information from the toot
    content = toot.content;
    displayName = toot.account.display_name;
    account = toot.account.acct;
    avatarUrl = toot.account.avatar;
    
    // Construct user's page url 
    accountUser = account.split('@')[0];
    accountDomain = account.split('@')[1];
    accountUrl = "https://" + accountDomain + "/@" + accountUser;
    
    // Create container for entire toot
    var item = document.createElement('div');
    item.className += " fp-item";

    // Create header
    var header = document.createElement('div');
    item.appendChild(header);
    header.className += " fp-header";

    // Create the avatar
    var avatarLink = document.createElement('a');
    header.appendChild(avatarLink);
    avatarLink.setAttribute('href', accountUrl);    
    var avatar = document.createElement('img');
    avatarLink.appendChild(avatar);
    avatar.className += " fp-avatar";
    avatar.setAttribute('src', avatarUrl);
    avatar.setAttribute('width', 38);
    avatar.setAttribute('height', 38);    

    // Create the name and account links
    var nameLink = document.createElement('a');
    header.appendChild(nameLink);
    nameLink.setAttribute('href', accountUrl);    
    displaySpan = document.createElement('span');
    displaySpan.className += "fp-display";
    nameLink.appendChild(displaySpan);
    displaySpan.textContent = displayName;
    accountSpan = document.createElement('span');
    accountSpan.className += " fp-account";
    nameLink.appendChild(accountSpan);
    accountSpan.textContent = ' ' + account;

    // Create the item
    var itemContent = document.createElement('div');
    item.appendChild(itemContent);
    itemContent.className += " fp-content";
    // TODO find a way to sanitize this content!!!
    itemContent.innerHTML = content;
    
    return item;
};

/**
 * Insert mastodon data into page.
 */
var insertToots = function (data) {
    
    // Find the DOM element for the feed
    var feed;
    var divs = document.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].getAttribute('role') == "feed") {
            feed = divs[i];
            break;
        }
    }
    // Find the first post in the feed so we can insert before it.
    var firstPost = feed.children[0];
    // Insert mastodon content
    for (i = 9; i >= 0; i--) {
        feed.insertBefore(buildItem(data[i]), firstPost);
    }    
};

/**
 * Handle timeline data sent from mastodon server.
 */
var onTimelineLoad = function () {
    data = JSON.parse(this.responseText);
    insertToots(data);
};

onPageLoad();



