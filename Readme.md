
# FeedParty
A Chrome extension to insert toots from a Mastodon timeline into a Facebook news feed.

## Installation
Download this the current extension code from [https://github.com/elplatt/FeedParty/archive/master.zip].
Unzip this code. That will create a folder called `FeedParty`, there should be a folder inside that also called `FeedParty`.
That folder is the unpacked extension folder and it's what you'll load with chrome.

Next, open Chrome and enter `chrome://extensions` in the url bar. Click the "Developer mode" switch in the upper right of the page to the "on" position. There should be a row of buttons near the top of the page. One of them says "Load unpacked." Click that button and select the unpacked extension folder from the step above. After selecting that folder, make sure the extension is enabled.

## Usage
When the extension is enabled, there will be an "FP" icon to the right of the url bar.
Clicking that icon brings up a login form. Enter the hostname of your mastodon server (example: "octodon.social"),
as well as the email address and password you use to log into that server. Then click the "Log In" button.
After a moment, you should see the password prompt dissapear and the "Log In" button change to "Log Out", which means
you are logged in to your mastodon instance.

Whenever you navigate to `facebook.com` or use the browser refresh button while on that page,
the extension will fetch the latest toots in your mastodon timeline, and if there are any you haven't seen yet,
they will be added to the top of your facebook feed. Only the first 10 are shown.

## Files
background.js - Runs in the browser background. This file interacts with the mastodon API and browser storage.
config.html - The HTML for the configuration popup window.
config.js - The javascript for the configuration popup window. Uses sendMessage() to communicate with background.js.
content.css - CSS for the content added to the news feed.
content.js - Fetches mastodon content and adds it to newsfeed.
fpconfig.js - Provides a class used to store mastodon server, username, and auth token.
icon.png - Toolbar icon
manifest.json - Info about extension
mastodon-api.js - Provides an interface to the Mastodon OAuth API
parser.js - Provides simple html parsing for sanitizing mastodon content.
