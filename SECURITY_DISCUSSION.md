# API Key Security - Implementation Options

## Current Situation
API key is stored in **plain text** in `chrome.storage.local`:
```javascript
await chrome.storage.local.set({ claudeApiKey: apiKey });
```

## Security Context
**Important**: Chrome extensions have their own sandboxed storage that is:
- Not accessible by websites or other extensions
- Encrypted at rest by the operating system (on disk)
- Only vulnerable if the user's machine is compromised or malicious extension installed

## Option 1: Use chrome.storage.session (RECOMMENDED)
**What it does**: Stores API key only for browser session (cleared when browser closes)

**Pros**:
- Simple to implement (change `.local` to `.session`)
- Automatically cleared on browser close
- Same security as .local while browser is running
- No additional complexity

**Cons**:
- User must re-enter API key every time they open browser
- Poor UX for daily use

**Implementation**:
```javascript
// settings.js - line 61
await chrome.storage.session.set({ claudeApiKey: apiKey });

// background.js - line 275
const storage = await chrome.storage.session.get(['claudeApiKey']);
```

## Option 2: Web Crypto API Encryption
**What it does**: Encrypts API key before storing in chrome.storage.local

**Pros**:
- API key encrypted at rest
- Persistent across browser restarts

**Cons**:
- **Encryption key must be stored somewhere** - defeats the purpose if also in chrome.storage
- Only effective if encryption key is derived from user password (adds UX friction)
- Adds significant complexity
- Still vulnerable if attacker can execute code in extension context

**Implementation Issues**:
Where do we store the encryption key?
1. Hardcode in extension code → Decompilable, useless
2. Derive from user password → User must enter password every time
3. Generate randomly and store in chrome.storage → Same vulnerability

## Option 3: Do Nothing (VALID CHOICE)
**Reasoning**:
- chrome.storage.local is already sandboxed and OS-encrypted
- If attacker can read chrome.storage, they likely have full system access anyway
- API key is rate-limited and can be revoked
- Users should use API keys with appropriate rate limits/billing alerts

**Trade-off**: Accept the risk in exchange for good UX

## Recommendation
**For internal corporate tool (like this)**: Option 1 (chrome.storage.session)
- Corporate environment, users enter key once per day
- Reduced risk window (cleared on browser close)
- Simple implementation

**For consumer product**: Option 3 (Do Nothing) + Add warning
- Add clear warning in settings UI: "Your API key is stored securely in browser storage. Only install trusted extensions."
- Implement rate limiting (already done)
- Add billing alerts in Anthropic Console

## Decision Required
Which option should we implement?

1. **chrome.storage.session** (require re-entry on browser restart)
2. **Web Crypto encryption** (with user password - complex UX)
3. **Keep current implementation** (add security warning in UI)

My recommendation: **Option 1 or 3** depending on user tolerance for re-entering API key.

---

## ✅ DECISION: Option 3 Implemented

**Date**: 2025-11-18
**Decision**: Keep current chrome.storage.local implementation + add security warning

**Rationale**:
- chrome.storage.local is already sandboxed per extension (not accessible to websites or other extensions)
- Storage is encrypted at rest by the operating system
- Good user experience (no re-entering API key)
- Security warning educates users on best practices (rate limits, billing alerts)

**Implementation**:
- Added yellow security warning banner in settings.html (lines 220-223)
- Warning includes link to Anthropic Console for rate limits and billing alerts
- Clear messaging: "Only install trusted Chrome extensions"

**Risks Acknowledged**:
- API key accessible if user's machine is compromised
- API key accessible if malicious extension installed with elevated permissions
- Mitigation: User education + Anthropic Console rate limits/alerts
