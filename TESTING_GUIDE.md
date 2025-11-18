# Security Fixes - Testing Guide

## Overview
This document provides step-by-step testing procedures for the 3 security fixes implemented in Step 7.13.

---

## Test 1: Rate Limiting (2-second cooldown)

**Purpose**: Prevent API spam and excessive costs

**Location**: `content.js:591-601`

**Test Steps**:
1. Load the extension on a Moveworks setup page
2. Open the chat assistant
3. Send a message: "Hello"
4. **Immediately** try to send another message: "Test"
5. **Expected Result**: Error message appears: "Please wait 2 seconds before sending another message."
6. Wait 2+ seconds
7. Send another message
8. **Expected Result**: Message sends successfully

**Pass Criteria**:
- ✅ Error message displays when sending < 2 seconds apart
- ✅ Countdown shows correct remaining time (1-2 seconds)
- ✅ Message sends successfully after waiting 2+ seconds
- ✅ User message is NOT added to chat when rate limited

---

## Test 2: Extension Context Recovery

**Purpose**: Detect when extension is updated/reloaded and prompt user to reload page

**Location**: `content.js:824-890`

**Test Steps**:

### Method 1: Extension Reload
1. Load the extension on a Moveworks setup page
2. Open the chat assistant (minimized or maximized)
3. Go to Chrome Extensions page (chrome://extensions)
4. Click "Reload" button on Moveworks Setup Assistant
5. Return to setup page
6. Wait 5-10 seconds
7. **Expected Result**: Orange banner appears at top of page:
   ```
   Extension Updated: The Moveworks Setup Assistant extension has been updated.
   [Reload Page]
   ```
8. Click "Reload Page" button
9. **Expected Result**: Page reloads, extension works normally

### Method 2: Console Simulation
1. Open DevTools Console
2. Run: `chrome.runtime.id = undefined`
3. Wait 5-10 seconds
4. **Expected Result**: Banner appears

**Pass Criteria**:
- ✅ Banner appears within 5-10 seconds of extension reload
- ✅ Banner has orange background (#FF9B8A)
- ✅ Banner appears at top of page (z-index 10002)
- ✅ "Reload Page" button reloads the page
- ✅ Banner doesn't duplicate (only one banner)
- ✅ Console shows: "⚠️ Extension context invalidated. User needs to reload page."

---

## Test 3: XSS Prevention in Markdown

**Purpose**: Prevent malicious script injection in assistant responses

**Location**: `content.js:672-687, 743`

**Test Scenarios**:

### Scenario A: Malicious HTML Tags
**Setup**: Mock Claude API to return malicious response
1. Temporarily modify `background.js:380` to return:
   ```javascript
   return {
     success: true,
     message: '<script>alert("XSS")</script>Hello'
   };
   ```
2. Send any message to assistant
3. **Expected Result**: Response shows as plain text:
   ```
   &lt;script&gt;alert("XSS")&lt;/script&gt;Hello
   ```
4. **NOT**: JavaScript alert popup

### Scenario B: Malicious URL in href
**Setup**: Mock response with JavaScript URL
1. Modify `background.js:380` to return:
   ```javascript
   return {
     success: true,
     message: '[Click me](javascript:alert("XSS"))'
   };
   ```
2. Send any message
3. **Expected Result**: Link is sanitized or escaped
4. **NOT**: JavaScript executes on click

### Scenario C: Malicious Source URL
**Setup**: Mock sources section
1. Modify `background.js:380` to return:
   ```javascript
   return {
     success: true,
     message: 'Test\n\nSources:\n[1] https://example.com"><script>alert("XSS")</script>'
   };
   ```
2. Send any message
3. **Expected Result**: Quote marks are escaped to `&quot;`
4. Inspect HTML: href attribute should be properly escaped
5. **NOT**: Script tag visible in DOM or executable

**Pass Criteria**:
- ✅ HTML tags are escaped to entities (`<` → `&lt;`)
- ✅ JavaScript URLs are not executable
- ✅ Quote marks in URLs are escaped in href attributes
- ✅ No `<script>` tags appear in DOM (check DevTools Elements)
- ✅ User messages always use textContent (verify in DevTools)

---

## Test 4: API Key Security (Pending Decision)

**Current State**: API key stored in `chrome.storage.local` (plain text)

**No testing required yet** - awaiting user decision from SECURITY_DISCUSSION.md

---

## Quick Verification Commands

### Check Rate Limiting Variables
```javascript
// In console on setup page
console.log('Last send time:', lastSendTime);
console.log('Cooldown:', SEND_COOLDOWN);
```

### Check Extension Context Monitor
```javascript
// In console on setup page
console.log('Extension valid:', extensionContextValid);
console.log('Runtime ID:', chrome.runtime.id);
```

### Inspect Parsed HTML
```javascript
// In console on setup page
document.querySelectorAll('.message-content').forEach(msg => {
  console.log('Inner HTML:', msg.innerHTML);
});
```

---

## Regression Testing

After implementing fixes, verify existing functionality still works:

1. **Context Extraction** - Verify page context is still captured
2. **Citations** - Verify numbered references and sources section
3. **Markdown Formatting** - Verify headers, bold, italic, code blocks
4. **Off-Page Queries** - Verify detection and acknowledgment
5. **Widget States** - Verify minimized/maximized transitions
6. **URL Linkification** - Verify clickable links (non-malicious URLs)

---

## Known Limitations

1. **Rate Limiting**: Uses client-side timestamp (can be bypassed by page reload)
2. **Extension Context**: 5-second polling interval (not real-time)
3. **XSS Prevention**: Assumes Claude API is trusted (no defense against API compromise)
4. **API Key**: Still in plain text pending user decision

---

## Security Checklist

Before deployment:
- [ ] Rate limiting blocks rapid sends
- [ ] Extension reload triggers banner
- [ ] Malicious HTML is escaped
- [ ] JavaScript URLs are not executable
- [ ] User messages use textContent only
- [ ] API key security decision made
- [ ] All regression tests pass
