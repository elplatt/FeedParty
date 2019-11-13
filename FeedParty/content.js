(function () {

var config = new FPConfig();

/**
 * Main script (called from bottom of file).
 */
var onPageLoad = function () {
    config.load().then(() => {
        if (typeof(config.access_token) != "undefined") {
            chrome.runtime.sendMessage({
                'contentScriptQuery': 'loadTimeline'
            }, onTimelineLoad);
        }
    });
};    

/**
 * Helper function to quickly build DOM trees, takes either a string (to create)
 * a text node, or an array:
 * [
 *     tagname,
 *     {attribute1: value1, attribute2: value2, ...},
 *     child1,
 *     child2,
 *     ...
 * ]
 */
var objectToDom = function (o) {
    if (typeof(o) == "string") {
        return document.createTextNode(o);
    }
    var tagname = o[0];
    var attributes = o[1];
    var e = document.createElement(tagname);
    for (var key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            e.setAttribute(key, attributes[key]);
        }
    }
    for (var i = 2; i < o.length; i++) {
        e.appendChild(objectToDom(o[i]));
    }
    return e;
}

/**
 * Convert created_at timestamp into time passed.
 */
var getTimePassed = function (created_at) {
    var created = new Date(created_at);
    var now = new Date();
    secPassed = (now.getTime() - created.getTime()) / 1000;
    
    if (secPassed < 60) {
        return Math.round(secPassed) + "s";
    } else if (secPassed < 60*60) {
        return Math.round(secPassed / 60) + "m";
    } else if (secPassed < 60*60*24) {
        return Math.round(secPassed / (60*60)) + "h";
    } else {
        return Math.round(secPassed / (60*60*24)) + "d";
    }
};

/**
 * Build the DOM tree for a time passed link.
 */
var buildTimeLink = function (toot) {
    // Construct strings from toot
    var timePassed = getTimePassed(toot.created_at);
    var account = toot.account;
    var tootUrl = toot.url;
    if (toot.reblog) {
        account = toot.reblog.account;
        tootUrl = toot.reblog.url;
    }
    // Build and return DOM tree
    return objectToDom([
        "span", {class: "fp-meta"},
        ["a", {class: "fp-time-passed", href: tootUrl, target: "_blank"}, timePassed],
        " Mastodon"
    ]);
}
 
/**
 * Build the DOM tree for a name/account link
 */
var buildNameLink = function (account) {
    
    // Extract info from account API object
    var acct = account.acct;
    var displayName = account.display_name;
    
    // Build and return DOM tree
    var nameLink = document.createElement('a');
    nameLink.setAttribute('href', account.url);    
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
        booster.href = toot.account.url;
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
    
    // Add time link
    itemBody.appendChild(document.createElement('br'));
    itemBody.appendChild(buildTimeLink(toot));
    
    // Create the item
    var content = document.createElement('div');
    itemBody.appendChild(content);
    content.className += " fp-content";
    // Uses cleanMastodon() to protect against html injection
    content.innerHTML = cleanMastodon(toot.content);
    
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
    // Count unseen toots
    var latest = config.latest();
    var unseen = 0;
    for (i = 0; i < data.length; i++) {
        if (typeof(latest) === "undefined" || data[i].created_at > latest) {
            unseen += 1;
        }
    }
    // Find the first post in the feed so we can insert before it.
    var firstPost = feed.children[0];
    // Insert mastodon content
    var inserted = 0;
    var item;
    while (inserted < 5 && data.length > 0) {
        toot = data.pop();
        if (toot.created_at <= latest) {
            continue;
        }
        item = buildItem(toot);
        feed.insertBefore(item, firstPost);
        inserted += 1;
    }
};

/**
 * Insert mastodon status.
 */
var insertTootStatus = function () {
    
    // Find the DOM element for the feed
    var feed;
    var divs = document.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
        if (divs[i].getAttribute('role') == "feed") {
            feed = divs[i];
            break;
        }
    }
    var firstPost = feed.children[0];
    // Insert mastodon status
    var item = document.createElement('div');
    item.className += " fp-toot-status";
    item.id = "fp-toot-status";
    item.innerHTML = "0 more unread toots";
    feed.insertBefore(item, firstPost);
};

/**
 * Track the most recent toot seen.
 */
var updateLatest = function (data) {
    var latest = config.latest();
    for (var i = 0; i < data.length; i++) {
        if (typeof(latest) === 'undefined' || data[i].created_at > latest) {
            latest = data[i].created_at;
        }
    }
    config.latest(latest);
};

/**
 * Handle timeline data sent from mastodon server.
 */
var onTimelineLoad = function (data) {
    data = data.reverse();
    updateLatest(data);
    insertTootStatus();
    insertToots(data);
};

onPageLoad();

})();


