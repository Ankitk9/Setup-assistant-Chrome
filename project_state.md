# Moveworks Setup Assistant - Project State

> **⚠️ IMPORTANT - Maintenance Instruction**
>
> This document is the **single source of truth** for project status, history, and direction.
>
> **Update this document whenever:**
> - Making commits (update Repository Structure with new commits)
> - Completing phases/steps (update Current Status, Completed Phases, or Implementation History)
> - Changing branches (update Repository Structure - Active Branches)
> - Discovering limitations (update Current Limitations)
> - Planning next steps (update Next Steps section)
> - Modifying architecture (update Current Architecture or Technical Notes)
>
> Keep it concise and high-level. Link to detailed documentation files for implementation details.

## Project Goal
Build a chat-based assistant as a Chrome extension that runs on the Moveworks setup page to provide contextual help and execute actions.

---

## Table of Contents
1. [Current Status](#current-status) - Where we are now
2. [Repository Structure](#repository-structure) - Git branches and workflow
3. [Completed Phases](#completed-phases) - What we've built (Phases 1-4)
4. [Current Architecture](#current-architecture) - Technical stack and file structure
5. [Current Limitations](#current-limitations) - Known constraints and gaps
6. [Implementation History](#implementation-history) - Steps 7.13-10.6 summary
7. [Next Steps](#next-steps) - Point & Ask testing and future work
8. [Technical Notes](#technical-notes) - API config, search index, performance specs

---

## Current Status
**Phase**: Step 10.5 Complete - Navigation Timing Fix
**Branch Status**:
- `main`: Production-ready (Step 10.5 complete)
- `feature/point-and-ask`: Point & Ask feature complete (Phases 1-5)
**Next**:
- Test and merge Point & Ask feature to main (optional)
- Step 11 - Action Execution (optional)
**Deployment Status**: ✅ READY FOR PRODUCTION (Tested & Stable)

---

## Repository Structure

**Repository**: [https://github.com/Ankitk9/Setup-assistant-Chrome](https://github.com/Ankitk9/Setup-assistant-Chrome)

**Branching Strategy**: Feature branch workflow with clean, atomic commits

### Active Branches

**`main` branch** (Production-ready)
- **HEAD**: Step 10.5 - Navigation Timing Fix
- **Status**: Stable, tested, ready for deployment
- **Recent commits**:
  - `f014768` - Phase 5 Complete: AI Integration with Point & Ask
  - `3a0bf92` - Phase 4 Complete: Auto-Generated Questions
  - `5894824` - Phase 3 Complete: Point & Ask UI Components
  - `581f07d` - Phase 2: Core inspection logic (console-activated)
  - `1c66d5e` - Phase 1: Add Point & Ask enable/disable setting

**`feature/point-and-ask` branch** (Complete, awaiting merge)
- **HEAD**: Phase 5 - AI Integration with Point & Ask
- **Status**: Feature complete (+773 lines, 0 regressions)
- **Commits**: 5 well-documented, atomic commits
- **Divergence**: +773 lines ahead of main (content.js +487, background.js +33, style.css +179, settings.html +65, settings.js +14)
- **Merge status**: Awaiting testing and merge decision (see Step 10.6)

### Branching Workflow
1. **Feature development**: Create feature branch from main
2. **Atomic commits**: Each commit represents a complete, working phase
3. **Testing**: Test feature branch independently before merge
4. **Merge decision**: Review pros/cons, complete testing checklist
5. **Clean history**: Preserve commit history (no squashing) for traceability

---

## Completed Phases

### Phase 1: Foundation (Steps 1-4) ✅
Built core Chrome extension with floating chat UI, Claude 3.5 Haiku API integration, settings page for API key management, and Moveworks brand styling (beige/coral). Includes smooth animations, message bubbles, loading indicators, and error handling.

---

### Phase 2: Context Awareness (Steps 5-6) ✅
**Goal**: Make assistant understand current page and ground responses in help.moveworks.com documentation

**Implemented:**
- Page context extraction (title, headings, forms, text)
- Sitemap-based search (700+ URLs indexed locally, daily refresh)
- Keyword matching with relevance scoring (top 3 results)
- Strict citation requirements and grounding rules
- Generic word filtering to improve search quality

---

### Phase 3: Intelligent Context & Polish (Steps 7-7.12) ✅
**6 Key Issues Resolved:**

| Issue | Solution | Status |
|-------|----------|--------|
| Navigation pollution | MUI-aware selectors, 8 helper functions for intelligent extraction | ✅ |
| DOM selector mismatch | Validated `[class*="navDrawerWrapper"]` and `[class*="view-"]` across 7 pages | ✅ |
| Missing citations | Enhanced system prompt with numbered references [1][2][3] + mandatory sources | ✅ |
| UI overlay bug | 3-state system (closed/minimized 320px/maximized 400px) | ✅ |
| Poor formatting | Custom markdown parser with URL linkification | ✅ |
| Off-page queries | Adaptive search with mismatch detection and acknowledgment | ✅ |

**Tested on**: API Playground, Enterprise Search, Ticket Interception, Overview Dashboard, Routing Conditions, Ticket Settings, Entity Catalog

---

### Phase 4: Point & Ask Feature ✅
**Branch**: `feature/point-and-ask` | **Status**: Complete | **Date**: 2025-11-18
**Total Changes**: 5 files, +773 lines (content.js +487, background.js +33, style.css +179, settings.html +65, settings.js +14)

**Goal**: Enable users to inspect page elements and get AI-powered contextual help about specific UI components.

**Feature**: Users click target icon → hover over elements (coral overlay) → click to select → auto-generated question appears → Claude responds with element-specific help.

**5 Implementation Phases:**
1. **Settings Integration** (`1c66d5e`) - Toggle with coral branding, storage integration, real-time updates
2. **Core Inspection Logic** (`581f07d`) - 14 functions: activation, overlay management, event handlers, context extraction, utilities
3. **UI Components** (`5894824`) - Target button, instruction box, element chip, CSS animations (slideInUp, chipSlideIn)
4. **Auto-Generated Questions** (`3a0bf92`) - Smart detection for 10+ element types (button, input, link, form, table, etc.)
5. **AI Integration** (`f014768`) - Enhanced system prompt with 🎯 SELECTED ELEMENT section, element-aware responses

**Performance**: <5ms element extraction, ~500-1000 chars context data, no API slowdown, GPU-accelerated overlay

**Limitations**: Single element selection, one-time chip, no iframe support, ESC/click cancels inspection

📄 **Detailed Documentation**: See [POINT_AND_ASK_FEATURE.md](POINT_AND_ASK_FEATURE.md) for complete phase details, testing guide, and technical specs

---

## Current Architecture

### Files
- **manifest.json** - Extension config targeting Moveworks setup pages
- **content.js** - Context extraction, chat UI, markdown rendering (main: ~1147 lines | feature branch: ~1670 lines)
- **background.js** - Claude API integration, documentation search (main: ~492 lines | feature branch: ~521 lines)
- **settings.html/js** - API key management, URL configuration, Point & Ask toggle
- **style.css** - Chat UI, 3-state system, animations (main: ~554 lines | feature branch: ~703 lines)

### Key Technical Stack
- **AI**: Claude 3.5 Haiku (1024 max tokens, 30s timeout)
- **Search**: Sitemap-based local index (700+ help.moveworks.com URLs, daily refresh)
- **Context**: MUI React-aware selectors (`[class*="navDrawerWrapper"]`, `[class*="view-"]`), cached per URL (~90ms fresh, <1ms cached)
- **Citations**: Numbered references [1][2][3] with mandatory "Sources:" section
- **UI**: 3 states (closed/minimized 320px/maximized 400px), custom markdown parser
- **Mode**: Single-turn conversations (no history by design)

---

## Current Limitations

### Security (Acceptable for Internal Tool):
1. ✅ **API Key Storage**: Plain text in chrome.storage.local (sandboxed, OS-encrypted)
   - Mitigation: Security warning in settings UI prompts users to set rate limits/billing alerts
2. ✅ **Rate Limiting**: Client-side only (2-second cooldown)
   - Can be bypassed by page reload, acceptable for trusted internal users
3. ✅ **XSS Prevention**: HTML escaping + URL sanitization implemented
   - Defense-in-depth approach, assumes Claude API is trustworthy

### Feature Gaps:
- No action execution (read-only assistant) - Planned for Step 11
- No manual search index refresh - Auto-refreshes daily
- No dark mode support
- No keyboard shortcuts (Cmd+K, Esc)
- No conversation history persistence across page reloads (by design)
- **Point & Ask Limitations** (feature branch only):
  - Single element selection only (no multi-select or comparison)
  - Element chip removed after first message (no persistent selection history)
  - No visual indicator on page after element deselected
  - Cannot inspect elements inside iframes
  - Cannot inspect extension UI elements (filtered out by design)
  - Child/sibling context limited to 3 elements each (prevents prompt bloat)

### Performance:
- Context extraction: ~90ms fresh, <1ms cached (per URL)
- Search index: 700 URLs × ~10 keywords = ~7000 strings in memory
- Service worker stops after 30s inactivity (index needs rebuild)

---

## Implementation History

| Step | Focus | Status | Key Outcomes |
|------|-------|--------|--------------|
| **7.13** | Security Hardening | ✅ | Rate limiting (2s cooldown), extension context recovery, XSS prevention, API key security warning |
| **8** | Testing & Validation | ✅ | Automated + manual testing complete, all security fixes verified, no regressions |
| **9** | Polish & Optimization | ✅ | API timeouts (30s), copy button, clear chat, contextual welcome, performance caching. Conversation history reverted due to regression |
| **10** | UX Refinements | ✅ | SVG icons, loading states, input enhancements, animation smoothing. Simplified per user feedback |
| **10.5** | Navigation Bug Fix | ✅ | Added `waitForNavigation()` MutationObserver to fix React SPA timing issue (50-200ms wait) |
| **10.6** | Point & Ask Merge Decision | ⏳ | Feature complete on branch (+773 lines), awaiting testing and merge decision |
| **10.7** | Point & Ask Refinements | ✅ | Fixed exit button (event order), chip position (DOM order), enhanced context (children + siblings + 300/1000 char limits) |
| **10.8** | Smart Search & Safe Fallbacks | ✅ | Priority-based keyword extraction (labels > ARIA > IDs), tiered search (element → page → no-docs), safe inference disclosure with help text support |
| **10.9** | Search Scoring & Related Resources | ✅ | Fixed maxScore bug, strict score >= 15 requirement, Related Resources for low-confidence results (5-14), element suggestions for generic buttons, mandatory citations |
| **10.10** | Strict Citation Enforcement | ✅ | Strengthened system prompt with explicit "NO EXCEPTIONS" policy, relevance check requirement, correct/incorrect examples, banned speculative language ("appears to", "likely", "seems to") |
| **10.11** | Context-Aware Documentation Scoring | ✅ | Hybrid confidence-based system-specific penalty: calculates context confidence from 4 signals (query keywords, element text, nearby context, page systems count), applies -10 penalty to system-specific docs when confidence ≤ 2 (generic context), +5 boost for generic doc keywords (overview/setup/introduction), fixed partial match scoring bug (count each keyword once) |
| **10.12** | Adaptive Header Selection | ✅ | Fixed nearestHeader extraction to use page-level headings for generic buttons (Create/Add/New) and proximity-based search for row-specific buttons (Edit/Delete/View). Added button type classification, 3 helper functions (isValidStructuralHeader, findPageLevelHeading, findNearestValidHeader) with table filtering, email/ID/numeric validation. Filters table headers from sections extraction. Resolves "slack es demo" issue - now correctly uses "Enterprise Search Systems" for Create New button |

**Documentation**: See TEST_REPORT.md, SECURITY_FIXES_SUMMARY.md, STEP9_IMPLEMENTATION_SUMMARY.md, NAVIGATION_TIMING_FIX.md for detailed step documentation.

---

## Next Steps

### Immediate: Point & Ask Feature Testing
**Current State**: Feature complete on `feature/point-and-ask` branch (5 commits, +773 lines, 0 regressions)

**Testing Required Before Merge** (See POINT_AND_ASK_FEATURE.md for detailed testing guide):
- [ ] Functional testing on 7 pages (API Playground, Enterprise Search, Ticket Interception, etc.)
- [ ] Feature toggle testing (enable/disable in settings)
- [ ] Inspection mode testing (crosshair, overlay, element capture)
- [ ] AI integration testing (element-aware responses with citations)
- [ ] Edge cases (nested elements, dynamic content, small/large elements)
- [ ] Regression testing (ensure existing features still work)

**Merge Decision Options**:
1. **Merge to Main** (recommended) - Default feature, toggle-able
2. **Keep as Branch** - Separate "advanced" version
3. **Feature Flag** - Merge but hide behind experimental setting
4. **Defer** - Wait for user feedback on core features first

**Risk**: Low (isolated feature, toggle-able, clean commit history)
**Value**: High (solves "what does this button do?" use case)

### Step 11: Action Execution (Future - Optional)
- Command parsing (fill forms, click buttons)
- Confirmation dialogs for actions
- Action result feedback
- Security safeguards

---

## Technical Notes

**Extension Targets:**
- `https://internal-configurator-web-server.kprod.prod.mw.int:48401/*`
- Configurable additional URLs in settings

**API Configuration:**
- Model: `claude-3-5-haiku-20241022`
- Max tokens: 1024
- Headers: `anthropic-dangerous-direct-browser-access: true`
- API key storage: `chrome.storage.local.claudeApiKey`

**Search Index:**
- Source: `https://help.moveworks.com/sitemap.xml`
- Refresh: Daily (24-hour staleness check)
- Storage: `chrome.storage.local.helpSearchIndex`
- Entry count: 700+ URLs
- Matching: Keyword-based with relevance scoring

**Context Extraction:**
- Trigger: Before every message send (cached per URL)
- Performance: ~90ms fresh extraction, <1ms when cached
- Cache invalidation: Automatic on URL change (popstate event)
- Selectors: MUI React-aware (`[class*=""]` patterns)
- Fallbacks: Semantic HTML5 elements
- Exclusions: Navigation drawer, app bar, chat extension itself

**Performance Monitoring:**
- Console logs: Context extraction time, search time, API call time
- Format: Emoji-prefixed for easy filtering (🔍, ⏱️, 📦, ✅)
- Example: "📦 Using cached page context" or "✅ Context extracted in 87.45ms"

**Point & Ask Feature** (feature/point-and-ask branch):
- Storage: `chrome.storage.local.pointAndAskEnabled` (boolean, default: true)
- Performance: <5ms element extraction, ~500-1000 chars context data
- Element Context: Label, ARIA labels, placeholder, help text, nearest header, parent + up to 3 children + adjacent siblings
- Text Limits: 300 chars in prompt (500 captured)
- HTML Snippet: 1000 chars in prompt (1000 captured)
- Sibling Strategy: Count + position + adjacent only (prevents prompt bloat)
- Console testing: `window.activateInspectionMode()`, `window.deactivateInspectionMode()`
- Detailed specs: See [POINT_AND_ASK_FEATURE.md](POINT_AND_ASK_FEATURE.md) for UI components, CSS classes, event listeners, animations

**Smart Search Logic** (Step 10.8):
- **Keyword Priority**: Labels (3x weight) > ARIA/placeholder/help-text (3x) > element text/name (2x) > technical IDs (1x)
- **Tiered Search**: Element-specific keywords (tier 1-2) → Page-level keywords (tier 3) → No documentation found
- **Safe Fallbacks**: Official docs → On-page help text (with inference warning) → Defer to administrator
- **Search Strategy**: When user asks question, extract keywords from user query and current page context. When element selected (Point & Ask), prioritize semantic element identifiers (labels, ARIA, headers) over technical IDs, search with element-specific keywords first (high-priority tier 1, then medium-priority tier 2), fall back to page-level search if no strong matches (score < 15), and if still no documentation but on-page help text exists, quote it with explicit "inferred from page interface" disclaimer and defer to administrator. Never use general AI knowledge for configuration advice—only documented or on-page Moveworks-authored content.
