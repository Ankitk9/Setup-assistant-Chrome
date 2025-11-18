# Quick Test Guide - Security Fixes

**Purpose**: Fast verification of all 4 security fixes in browser environment

---

## Prerequisites

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the project directory: `/Users/ankitkant/Documents/Vibe coding Experiments/Setup assistant`
5. Note the extension ID for debugging

---

## Test 1: Rate Limiting (30 seconds)

**Steps**:
1. Navigate to any Moveworks setup page (or the configured URL)
2. Click the floating chat button (bottom-right)
3. Type "Hello" and press Enter
4. **Immediately** type "Test" and press Enter (within 2 seconds)

**Expected Result**:
- ✅ Error message appears: "Please wait 1 second before sending another message."
- ✅ "Test" message is NOT sent to Claude API
- ✅ No loading indicator appears

**Wait 2 seconds, then**:
5. Type "Test again" and press Enter

**Expected Result**:
- ✅ Message sends successfully
- ✅ Loading indicator appears ("Thinking...")
- ✅ Claude responds normally

**Pass**: ✅ / ❌

---

## Test 2: Extension Context Recovery (1 minute)

**Steps**:
1. With the extension loaded, open the chat assistant
2. Send a test message to verify it's working
3. **Without closing the tab**, go to `chrome://extensions/`
4. Find "Moveworks Setup Assistant"
5. Click the reload icon (circular arrow)
6. Return to the setup page tab
7. Wait 5-10 seconds

**Expected Result**:
- ✅ Orange banner appears at top of page:
  ```
  Extension Updated: The Moveworks Setup Assistant extension has been updated.
  [Reload Page]
  ```
- ✅ Banner has orange background (#FF9B8A)
- ✅ Banner is at very top of page (above everything)

8. Click "Reload Page" button

**Expected Result**:
- ✅ Page reloads
- ✅ Extension works normally after reload
- ✅ Banner does not reappear

**Pass**: ✅ / ❌

---

## Test 3: XSS Prevention (2 minutes)

**Option A: Console Mock** (Quick)

1. Open DevTools Console (F12)
2. Send a normal message first to verify chat works
3. Paste and run this code to mock the API response:
```javascript
// Intercept the next message response
const originalSendMessage = chrome.runtime.sendMessage;
chrome.runtime.sendMessage = function(message, callback) {
  if (message.type === 'SEND_TO_CLAUDE') {
    // Return malicious response
    if (callback) {
      callback({
        success: true,
        message: '<script>alert("XSS")</script>Click this: <a href="javascript:alert(\'XSS\')">Link</a>'
      });
    }
    return Promise.resolve({
      success: true,
      message: '<script>alert("XSS")</script>Click this: <a href="javascript:alert(\'XSS\')">Link</a>'
    });
  }
  return originalSendMessage.apply(this, arguments);
};
```
4. Send any message in the chat

**Expected Result**:
- ✅ NO JavaScript alert popup appears
- ✅ Message displays as plain text: `<script>alert("XSS")</script>Click this: ...`
- ✅ Script tags are visible as text (escaped)
- ✅ Link is NOT clickable (or if clickable, does not execute JavaScript)

**Option B: DevTools Inspection** (Thorough)

1. Send any message to get a response
2. Open DevTools → Elements tab
3. Find the assistant message content: `<div class="message-content">`
4. Inspect the inner HTML

**Expected Result**:
- ✅ NO `<script>` tags in the DOM (should see `&lt;script&gt;` instead)
- ✅ User messages have no `innerHTML` (only `textContent`)
- ✅ All href attributes are properly quoted
- ✅ No executable JavaScript in href attributes

**Pass**: ✅ / ❌

---

## Test 4: API Key Security Warning (30 seconds)

**Steps**:
1. Right-click the extension icon → "Options" (or go to `chrome://extensions/` and click "Extension options")
2. Settings page opens
3. Look below the "Claude API Key" input field

**Expected Result**:
- ✅ Yellow warning banner is visible
- ✅ Banner has heading "Security Notice:"
- ✅ Banner text includes:
  - "stored in browser storage encrypted by your operating system"
  - "Only install trusted Chrome extensions"
  - "Set rate limits and billing alerts"
- ✅ "Anthropic Console" is a clickable link
- ✅ Link opens in new tab to `https://console.anthropic.com/settings/limits`

**Pass**: ✅ / ❌

---

## Quick Regression Check (2 minutes)

Verify existing features still work:

**1. Context Extraction**:
- ✅ Assistant responses reference current page content
- ✅ Responses mention page title or section name

**2. Citations**:
- ✅ Responses include numbered references [1], [2], [3]
- ✅ "Sources:" section appears at end of response
- ✅ Source links are clickable

**3. Formatting**:
- ✅ Bold, italic, code blocks render correctly
- ✅ URLs in response are clickable links
- ✅ Lists and headers format properly

**4. Widget States**:
- ✅ Minimize button works (chat becomes small floating window)
- ✅ Maximize button works (chat becomes full sidebar)
- ✅ Close button works (chat disappears, toggle button remains)

**Pass**: ✅ / ❌

---

## Debugging Tips

### If Rate Limiting Doesn't Work:
- Check console for errors: `Uncaught ReferenceError: lastSendTime is not defined`
- Verify content.js loaded: `console.log(lastSendTime, SEND_COOLDOWN)`

### If Context Recovery Doesn't Work:
- Check console for: `⚠️ Extension context invalidated`
- Verify monitoring started: `console.log('Monitoring:', extensionContextValid)`
- Try longer wait time (up to 10 seconds)

### If XSS Prevention Fails:
- Verify parseMarkdown function: `console.log(parseMarkdown('<script>test</script>'))`
- Should output: `<p>&lt;script&gt;test&lt;/script&gt;</p>`

### If Warning Not Visible:
- Check settings.html loaded correctly
- Inspect element: `.security-warning` should exist
- Check CSS: Yellow background should be `#FFF3CD`

---

## Test Results

| Feature | Status | Notes |
|---------|--------|-------|
| Rate Limiting | ⬜ | |
| Extension Context Recovery | ⬜ | |
| XSS Prevention | ⬜ | |
| API Key Warning | ⬜ | |
| Regression Check | ⬜ | |

**Overall**: ⬜ PASS / ⬜ FAIL

**Issues Found**: (List any problems discovered)

---

## Next Steps After Testing

**If All Tests Pass** ✅:
- Extension is ready for production use
- Consider Step 9 (Polish & Optimization) for additional features

**If Tests Fail** ❌:
- Document specific failures
- Check TEST_REPORT.md for expected behavior
- Review code in content.js, background.js, settings.html
- Check browser console for error messages
