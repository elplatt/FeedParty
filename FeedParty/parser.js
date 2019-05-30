cleanMastodon = function(text) {
    // Tags to keep, all others are ignored
    allowedTags = ['p', 'br', 'br/', 'span', 'a']
    // Initialize data structures
    tagStack = []
    fragmentStack = []
    currentFragment = ''
    inTag = false
    currentTag = ''
    isOpeningTag = true
    // Iterate through characters of string
    for (var i = 0; i < text.length; i++) {
        // Check for special characters
        if (text[i] == '<') {
            if (inTag) {
                // Ignore open tag if we're already in a tag
                continue
            } else {
                // Start a new tag
                inTag = true
                isOpeningTag = true
                currentTag = ''
            }
        } else if (text[i] == '>') {
            if (inTag) {
                inTag = false
                // Close the current tag
                parts = currentTag.split(/\s+/)
                tagName = parts[0].toLowerCase()
                if (!allowedTags.includes(tagName)) {
                    continue
                }
                if (isOpeningTag) {
                    // Check for self-closing tag
                    if (tagName == 'br' || tagName == 'br/') {
                        // Add tag to current fragment
                        currentFragment += '<' + tagName + '>'
                    } else {
                        // Push tag and fragment to stack
                        tagStack.push(tagName)
                        fragmentStack.push(currentFragment)
                        currentFragment = ''
                    }
                } else {
                    if (tagName != tagStack[tagStack.length - 1]) {
                        // If closing tag does not match opening, ignore
                        continue
                    }
                    // Wrap fragment in tag, merge with top of stack
                    tagStack.pop()
                    currentFragment = fragmentStack.pop() + '<' + tagName + '>' + currentFragment + '</' + tagName + '>'
                }
            } else {
                // Replace with html entity
                currentFragment += '&gt;'
            }
        } else {
            if (inTag) {
                // Check for closing tag
                if (currentTag == '' && text[i] == '/') {
                    // Mark as closing tag
                    isOpeningTag = false
                } else {
                    // Add to tag
                    currentTag += text[i]
                }
            } else {
                currentFragment += text[i]
            }
        }
    }
    return currentFragment;
}
