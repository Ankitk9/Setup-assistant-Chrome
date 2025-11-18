# Debug Logging Added - Navigation Context Investigation

**Date**: 2025-11-18
**Issue**: After extension reload + page reload, chat assistant shows generic "Moveworks Internal Configurator" instead of specific page (e.g., "API Playground")

---

## Debug Logging Added

### 1. Navigation Context Extraction (`extractNavigationContext()`)

**Location**: content.js:167-240

**Debug Output Shows**:
- ✅ Whether navigation element was found and which selector matched
- ✅ Number of active/selected items found
- ✅ Text content, tag names, and classes of each active item
- ✅ Which item was set as `activeItem` (last item)
- ✅ Which item was set as `activeSection` (second-to-last item)
- ✅ Whether breadcrumb fallback was triggered
- ✅ Final navigation context object (path, activeItem, activeSection)

**Console Prefix**: `🔍 [NAV DEBUG]`

**Example Output**:
```
🔍 [NAV DEBUG] Starting navigation context extraction...
🔍 [NAV DEBUG] Navigation element found with selector: "[class*="navDrawerWrapper"]"
🔍 [NAV DEBUG] Found 2 active/selected items
🔍 [NAV DEBUG] Active item 0: "Advanced Tools" (tag: DIV, classes: MuiListItem-root active)
🔍 [NAV DEBUG] Active item 1: "API Playground" (tag: DIV, classes: MuiListItem-root selected)
🔍 [NAV DEBUG] Set activeSection: "Advanced Tools"
🔍 [NAV DEBUG] Set activeItem: "API Playground"
🔍 [NAV DEBUG] Final navigation context: {path: ["Advanced Tools", "API Playground"], activeItem: "API Playground", activeSection: "Advanced Tools"}
```

---

### 2. Contextual Welcome Generation (`generateContextualWelcome()`)

**Location**: content.js:996-1010

**Debug Output Shows**:
- ✅ Whether page context was provided or null
- ✅ What `pageName` was determined (activeNavItem vs title fallback)
- ✅ Values of `activeNavItem` and `title` separately

**Console Prefix**: `💬 [WELCOME DEBUG]`

**Example Output**:
```
💬 [WELCOME DEBUG] Generating contextual welcome with context: {url: "...", title: "Moveworks Internal Configurator", activeNavItem: "API Playground", ...}
💬 [WELCOME DEBUG] pageName: "API Playground" (activeNavItem: "API Playground", title: "Moveworks Internal Configurator")
```

---

### 3. Existing Debug Output (Already Present)

**Page Context Summary** (`extractPageContext()`)

**Location**: content.js:630-641

**Console Prefix**: `📄 Page Context Extracted:`

This already shows:
- URL, navigation path, active nav item
- Main headings, page type, widgets
- Active tabs, text preview

---

## How to Test

### Step 1: Install the Updated Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Click "**Load unpacked**" and select the extension folder
3. Or click "**Reload**" if already installed

### Step 2: Reproduce the Issue

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. Navigate to the API Playground page (or any Moveworks setup page)
4. **Reload the extension** (chrome://extensions/ → Reload button)
5. **Reload the page** (hard refresh with Cmd+Shift+R or F5)
6. Open the chat assistant

### Step 3: Analyze Console Output

Look for the debug messages in this order:

```
1. 🔍 Extracting fresh page context...
2. 🔍 [NAV DEBUG] Starting navigation context extraction...
3. 🔍 [NAV DEBUG] Navigation element found with selector: "..."
   OR
   🔍 [NAV DEBUG] ❌ No navigation element found! Returning empty context.

4. 🔍 [NAV DEBUG] Found X active/selected items
5. 🔍 [NAV DEBUG] Active item 0: "..." (tag: ..., classes: ...)
   (repeated for each active item)

6. 🔍 [NAV DEBUG] Final navigation context: {...}

7. 📄 Page Context Extracted: {...}

8. 💬 [WELCOME DEBUG] Generating contextual welcome with context: {...}
9. 💬 [WELCOME DEBUG] pageName: "..." (activeNavItem: "...", title: "...")
```

---

## Diagnostic Questions to Answer

Based on the console output, we need to determine:

### Q1: Is the navigation element found?
- Look for: `🔍 [NAV DEBUG] Navigation element found with selector: "..."`
- If **YES**: Which selector? (Should be `[class*="navDrawerWrapper"]`)
- If **NO**: Problem is DOM structure changed or timing issue

### Q2: How many active items are found?
- Look for: `🔍 [NAV DEBUG] Found X active/selected items`
- If **0**: Active/selected classes not applied after reload
- If **1+**: Good, but check if text content is correct

### Q3: What are the active item texts?
- Look for: `🔍 [NAV DEBUG] Active item X: "..." (tag: ..., classes: ...)`
- Does the text match the actual navigation item?
- Are the classes correct (`active`, `selected`, `[aria-current="page"]`)?

### Q4: What is the final `activeNavItem`?
- Look for: `🔍 [NAV DEBUG] Final navigation context: {path: [...], activeItem: "...", ...}`
- Does `activeItem` have the correct page name?
- If empty: Navigation extraction failed completely

### Q5: What does the welcome message use?
- Look for: `💬 [WELCOME DEBUG] pageName: "..." (activeNavItem: "...", title: "...")`
- If `pageName === title`: Fallback was used (BAD)
- If `pageName === activeNavItem`: Correct value used (GOOD)

---

## Expected vs Actual Behavior

### Expected (Working Case):
```
🔍 [NAV DEBUG] Navigation element found with selector: "[class*="navDrawerWrapper"]"
🔍 [NAV DEBUG] Found 2 active/selected items
🔍 [NAV DEBUG] Active item 1: "API Playground"
🔍 [NAV DEBUG] Final navigation context: {path: ["Advanced Tools", "API Playground"], activeItem: "API Playground", ...}
💬 [WELCOME DEBUG] pageName: "API Playground" (activeNavItem: "API Playground", title: "Moveworks Internal Configurator")
```

### Suspected (After Reload):
```
🔍 [NAV DEBUG] Navigation element found with selector: "[class*="navDrawerWrapper"]"
🔍 [NAV DEBUG] Found 0 active/selected items
🔍 [NAV DEBUG] No active items found, trying breadcrumbs...
🔍 [NAV DEBUG] ❌ No breadcrumb found
🔍 [NAV DEBUG] Final navigation context: {path: [], activeItem: "", activeSection: ""}
💬 [WELCOME DEBUG] pageName: "Moveworks Internal Configurator" (activeNavItem: "", title: "Moveworks Internal Configurator")
```

**Root Cause Hypothesis**: After extension reload + page reload, MUI React components may not have applied `active` or `selected` classes yet (timing issue), or the classes are different after reload.

---

## Possible Solutions (Based on Findings)

### If Navigation Element Not Found:
- Selector has changed in new version
- Add more selectors or update existing ones

### If Active Items Not Found (Found 0):
- **Option A**: Timing issue - add `setTimeout()` or `requestIdleCallback()`
- **Option B**: Class names changed - inspect DOM and update selectors
- **Option C**: Different attribute after reload - check for `data-*` attributes

### If Active Items Found But Wrong Text:
- Text extraction logic issue
- Check for nested elements or icons

### If Cache Issue:
- Cache might be using stale context from before reload
- Force cache clear on extension update detection

---

## Next Steps

1. **Run the test** (reload extension → reload page → open chat)
2. **Copy all debug output** from Console
3. **Share the console logs** to diagnose the root cause
4. **Implement fix** based on findings
5. **Remove debug logging** once issue is resolved (or keep for production debugging)

---

## Files Modified

- **content.js**: Added ~30 lines of debug logging to 2 functions
  - `extractNavigationContext()`: Lines 168, 184, 190-191, 198, 206-207, 211, 215, 222-235, 238
  - `generateContextualWelcome()`: Lines 997, 1000-1001, 1005

---

## Status

**Debug Logging**: ✅ COMPLETE
**Testing**: ⏳ PENDING (User to run test and share console output)
**Fix**: ⏳ PENDING (Depends on test results)
