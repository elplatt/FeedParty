(function () {

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
 * Build account href from account
 */
var buildAccountUrl = function (account) {
    // Construct user's page url
    var accountUser = account.acct.split('@')[0];
    var accountDomain = account.acct.split('@')[1];
    var accountUrl = "https://" + accountDomain + "/@" + accountUser;
    return accountUrl;    
};

/**
 * Build the DOM tree for a name/account link
 */
var buildNameLink = function (account) {
    
    // Extract info from account API object
    var acct = account.acct;
    var displayName = account.display_name;
    
    // Construct user's page url 
    var accountUser = acct.split('@')[0];
    var accountDomain = acct.split('@')[1];
    var accountUrl = "https://" + accountDomain + "/@" + accountUser;

    // Build and return DOM tree
    var nameLink = document.createElement('a');
    nameLink.setAttribute('href', accountUrl);    
    var displaySpan = document.createElement('span');
    displaySpan.className += "fp-display";
    nameLink.appendChild(displaySpan);
    displaySpan.textContent = displayName;
    var accountSpan = document.createElement('span');
    accountSpan.className += " fp-account";
    nameLink.appendChild(accountSpan);
    accountSpan.textContent = ' ' + acct;
    
    return nameLink;
};

/**
 * Build a DOM element from data for a single toot from the mastodon API.
 */
var buildItem = function (toot) {
    
    // Create container for entire toot
    var item = document.createElement('div');
    item.className += " fp-item";

    // Create boosted block
    var boostedBlock = document.createElement('div');
    item.appendChild(boostedBlock);
    boostedBlock.className += " fp-boosted";
    boostedBlock.style.display = "none";
    
    // Create item body
    var itemBody = document.createElement('div');
    item.appendChild(itemBody);
    itemBody.className += " fp-item-body";
    
    // Create avatar block
    var avatarBlock = document.createElement('div');
    avatarBlock.className += ' fp-avatar-block';
    itemBody.appendChild(avatarBlock);
    
    // If reblog, create original author's avatar
    var avatar;
    var avatarLink;
    var reblog = false;
    if (toot.hasOwnProperty('reblog') && toot.reblog !== null) {
        reblog = true;
        
        // Fill boosted div
        var booster = document.createElement('a');
        booster.href = buildAccountUrl(toot.account);
        booster.appendChild(document.createTextNode(toot.account.display_name));
        var boostedText = document.createTextNode(' boosted');
        boostedBlock.appendChild(booster);
        boostedBlock.appendChild(boostedText);
        boostedBlock.style.display = "block";
        
        // Extract relevant information from the toot
        content = '';
        if (toot.reblog.hasOwnProperty('content')) {
            content = toot.reblog.content;            
        }
        displayName = toot.reblog.account.display_name;
        account = toot.reblog.account.acct;
        avatarUrl = toot.reblog.account.avatar;
        
        // Construct user's page url 
        accountUser = account.split('@')[0];
        accountDomain = account.split('@')[1];
        accountUrl = "https://" + accountDomain + "/@" + accountUser;

        // Create the avatar
        avatarLink = document.createElement('a');
        avatarBlock.appendChild(avatarLink);
        avatarLink.setAttribute('href', accountUrl);
        avatarLink.className += " fp-original-avatar";
        avatar = document.createElement('img');
        avatarLink.appendChild(avatar);
        avatar.setAttribute('src', avatarUrl);
    }
    
    // Extract relevant information from the toot
    var displayName = toot.account.display_name;
    var account = toot.account.acct;
    var avatarUrl = toot.account.avatar;
    
    // Construct user's page url 
    accountUser = account.split('@')[0];
    accountDomain = account.split('@')[1];
    accountUrl = "https://" + accountDomain + "/@" + accountUser;
    
    // Create the avatar
    avatarLink = document.createElement('a');
    avatarBlock.appendChild(avatarLink);
    avatarLink.setAttribute('href', accountUrl);    
    avatar = document.createElement('img');
    avatarLink.appendChild(avatar);
    if (reblog) {
        avatarLink.className += " fp-reblog-avatar";        
    }
    avatar.setAttribute('src', avatarUrl);

    // Create the name and account links
    if (reblog) {
        itemBody.appendChild(buildNameLink(toot.reblog.account));
    } else {
        itemBody.appendChild(buildNameLink(toot.account));
    }
    
    // Create the item
    var content = document.createElement('div');
    itemBody.appendChild(content);
    content.className += " fp-content";
    // TODO find a way to sanitize this content!!!
    content.innerHTML = toot.content;
    
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
    var item;
    for (i = 0; i < 10; i++) {
        item = buildItem(data[i]);
        feed.insertBefore(item, firstPost);
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

})();


