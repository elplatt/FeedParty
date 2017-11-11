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

    // Create header
    var header = document.createElement('div');
    item.appendChild(header);
    header.className += " fp-header";
    var boost = document.createElement('div');
    header.appendChild(boost);
    var avatarBlock = document.createElement('div');
    avatarBlock.className += ' fp-avatar-block';
    header.appendChild(avatarBlock);
    var textBlock = document.createElement('div');
    header.appendChild(textBlock);
    textBlock.className += " fp-text-block";
    
    // If reblog, create original author's avatar
    var avatar;
    var avatarLink;
    var reblog = false;
    if (toot.hasOwnProperty('reblog') && toot.reblog !== null) {
        reblog = true;
        
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
    var content = toot.content;
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
        textBlock.appendChild(buildNameLink(toot.reblog.account));
    } else {
        textBlock.appendChild(buildNameLink(toot.account));
    }
    
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



