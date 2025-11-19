// Background service worker for handling Claude API calls

// Build search index when extension is installed or updated
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    console.log('🚀 Extension installed/updated:', details.reason);
    await buildSearchIndex();
    console.log('✅ Initialization complete');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    console.error('Extension will continue in context-only mode');
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SEND_TO_CLAUDE') {
    handleClaudeRequest(request.message, request.context, request.selectedElement)
      .then(response => {
        sendResponse({ success: true, message: response });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Helper: Filter out generic question words
function filterGenericWords(keywords) {
  const genericWords = new Set(['what', 'page', 'about', 'this', 'that', 'here', 'there', 'where', 'when', 'who', 'which', 'does', 'mean', 'work', 'doing', 'used', 'see']);
  return keywords.filter(kw => !genericWords.has(kw));
}

// Helper: Extract keywords from text
function extractKeywords(text) {
  // Convert to lowercase and split by non-word characters
  const words = text.toLowerCase().split(/[\s\-_/]+/);

  // Filter out common stop words and short words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'how', 'com', 'www', 'http', 'https']);

  const filtered = words.filter(word => word.length > 2 && !stopWords.has(word));
  return filterGenericWords(filtered);
}

// Helper: Detect if user query is about off-page topic
function detectOffPageQuery(pageContext, helpDocs, userKeywords) {
  // If no docs found, can't be off-page
  if (!helpDocs || !helpDocs.found || !helpDocs.results || helpDocs.results.length === 0) {
    return false;
  }

  // Extract keywords from page context
  const pageText = `${pageContext.mainContentHeadings && pageContext.mainContentHeadings.length > 0 ? pageContext.mainContentHeadings[0].text : ''} ${pageContext.title || ''} ${pageContext.activeNavItem || ''}`;
  const pageKeywords = extractKeywords(pageText);

  // Extract keywords from found documentation
  const docKeywords = [];
  helpDocs.results.forEach(doc => {
    const docText = `${doc.title || ''} ${doc.url || ''}`;
    const keywords = extractKeywords(docText);
    docKeywords.push(...keywords);
  });

  // Calculate overlap between page and doc keywords
  const overlap = pageKeywords.filter(pk => docKeywords.includes(pk));

  // Low overlap (<2 matches) indicates off-page query
  return overlap.length < 2;
}

// System-specific keywords for context detection
const SYSTEM_KEYWORDS = [
  'slack', 'google', 'sharepoint', 'confluence', 'jira', 'servicenow',
  'zendesk', 'salesforce', 'microsoft', 'teams', 'onedrive', 'drive',
  'dropbox', 'box', 'notion', 'asana', 'monday', 'workday'
];

// Helper: Calculate context confidence score
// Returns: Positive score = system-specific context, Negative/Low score = generic context
function calculateContextConfidence(queryKeywords, selectedElement, pageContext) {
  let confidence = 0;

  // Signal 1: Query mentions system keyword (+3 confidence)
  const queryMentionsSystem = queryKeywords.some(kw => SYSTEM_KEYWORDS.includes(kw.toLowerCase()));
  if (queryMentionsSystem) {
    confidence += 3;
    console.log('  Context signal: Query mentions system (+3)');
  }

  // Signal 2: Element text/label mentions system (+3 confidence)
  if (selectedElement) {
    const elementText = [
      selectedElement.text || '',
      selectedElement.label || '',
      selectedElement.placeholder || ''
    ].join(' ').toLowerCase();

    const elementMentionsSystem = SYSTEM_KEYWORDS.some(sys => elementText.includes(sys));
    if (elementMentionsSystem) {
      confidence += 3;
      console.log('  Context signal: Element text mentions system (+3)');
    }

    // Signal 3: Nearby context (header/parent/siblings) mentions system (+2 confidence)
    const nearbyText = [
      selectedElement.nearestHeader || '',
      selectedElement.parent?.text || '',
      selectedElement.siblings?.next?.text || '',
      selectedElement.siblings?.previous?.text || ''
    ].join(' ').toLowerCase();

    const nearbyMentionsSystem = SYSTEM_KEYWORDS.some(sys => nearbyText.includes(sys));
    if (nearbyMentionsSystem) {
      confidence += 2;
      console.log('  Context signal: Nearby context mentions system (+2)');
    }
  }

  // Signal 4: Page shows multiple systems (-2 confidence, indicates generic context)
  if (pageContext) {
    const pageText = JSON.stringify(pageContext).toLowerCase();
    const systemsInPage = SYSTEM_KEYWORDS.filter(sys => pageText.includes(sys));
    if (systemsInPage.length >= 3) {
      confidence -= 2;
      console.log(`  Context signal: Page shows ${systemsInPage.length} systems (-2, generic context)`);
    }
  }

  console.log(`  📊 Context confidence score: ${confidence} (${confidence <= 2 ? 'GENERIC' : 'SYSTEM-SPECIFIC'})`);
  return confidence;
}

// Helper: Calculate relevance score
function calculateRelevance(queryKeywords, urlKeywords, contextConfidence = null) {
  let score = 0;

  // Exact keyword matches
  queryKeywords.forEach(qk => {
    if (urlKeywords.includes(qk)) {
      score += 10;
    }
  });

  // Partial matches (substring matching) - FIXED: Count each query keyword once
  queryKeywords.forEach(qk => {
    const hasPartialMatch = urlKeywords.some(uk =>
      (uk.includes(qk) || qk.includes(uk)) && !urlKeywords.includes(qk)
    );
    if (hasPartialMatch) {
      score += 5;
    }
  });

  // Boost for docs vs other sections
  if (urlKeywords.includes('docs')) score += 2;

  // Boost for generic documentation keywords
  const genericKeywords = ['overview', 'setup', 'getting-started', 'introduction', 'guide'];
  const hasGenericKeyword = urlKeywords.some(uk => genericKeywords.includes(uk));
  if (hasGenericKeyword) {
    score += 5;
    console.log('  Score boost: Generic doc keyword (+5)');
  }

  // Penalize very deep URLs (prefer overview pages)
  if (urlKeywords.length > 6) score -= 2;

  // Context-aware system-specific penalty
  if (contextConfidence !== null && contextConfidence <= 2) {
    // Low confidence = generic context, penalize system-specific docs
    const urlMentionsSystem = urlKeywords.some(uk => SYSTEM_KEYWORDS.includes(uk));
    if (urlMentionsSystem) {
      score -= 10;
      console.log('  Score penalty: System-specific doc in generic context (-10)');
    }
  }

  return score;
}

// Helper: Build search index from sitemap
async function buildSearchIndex() {
  console.log('📥 Building help.moveworks.com search index...');

  try {
    // Fetch sitemap
    console.log('  Fetching sitemap.xml...');
    const response = await fetch('https://help.moveworks.com/sitemap.xml');

    if (!response.ok) {
      console.error('  ❌ Sitemap fetch failed:', response.status, response.statusText);
      console.warn('  Continuing in context-only mode');
      return;
    }

    console.log('  ✅ Sitemap fetched successfully');
    const xmlText = await response.text();
    console.log(`  Sitemap size: ${xmlText.length} bytes`);

    // Parse XML and extract URLs
    console.log('  Parsing XML...');
    const urlMatches = xmlText.match(/<loc>(.*?)<\/loc>/g);

    if (!urlMatches || urlMatches.length === 0) {
      console.error('  ❌ No URLs found in sitemap');
      console.warn('  Continuing in context-only mode');
      return;
    }

    console.log(`  ✅ Found ${urlMatches.length} URLs`);

    // Build search index
    console.log('  Building search index...');
    const searchIndex = urlMatches.map(match => {
      const url = match.replace(/<\/?loc>/g, '');
      const keywords = extractKeywords(url);

      return {
        url: url,
        keywords: keywords
      };
    });

    console.log(`  ✅ Index built with ${searchIndex.length} entries`);

    // Store in chrome.storage
    console.log('  Saving to chrome.storage...');
    await chrome.storage.local.set({
      helpSearchIndex: searchIndex,
      lastUpdated: Date.now()
    });

    console.log(`✅ Search index saved successfully (${searchIndex.length} pages)`);
  } catch (error) {
    console.error('❌ Error building search index:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
    console.warn('Extension will continue in context-only mode');
    // Don't throw - let extension continue
  }
}

// Helper: Ensure search index is fresh
async function ensureSearchIndexFresh() {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const storage = await chrome.storage.local.get(['helpSearchIndex', 'lastUpdated']);

  if (!storage.helpSearchIndex || !storage.lastUpdated || Date.now() - storage.lastUpdated > ONE_DAY) {
    await buildSearchIndex();
  }
}

// Function to search help.moveworks.com
async function searchHelpMoveworks(query, selectedElement = null, pageContext = null) {
  console.log('🔍 searchHelpMoveworks called with query:', query);

  try {
    // Ensure index is available and fresh
    console.log('  Checking search index...');
    await ensureSearchIndexFresh();

    // Load search index
    const storage = await chrome.storage.local.get('helpSearchIndex');
    const searchIndex = storage.helpSearchIndex;

    if (!searchIndex || searchIndex.length === 0) {
      console.warn('⚠️  Search index not available - continuing in context-only mode');
      return { found: false, results: [] };
    }

    console.log(`  ✅ Search index loaded (${searchIndex.length} entries)`);

    // Extract keywords from query
    const queryKeywords = extractKeywords(query);
    console.log('  Keywords extracted:', queryKeywords);

    if (queryKeywords.length === 0) {
      console.warn('⚠️  No meaningful keywords extracted from query');
      return { found: false, results: [] };
    }

    // Calculate context confidence for scoring
    const contextConfidence = calculateContextConfidence(queryKeywords, selectedElement, pageContext);

    // Score each URL by relevance
    const scored = searchIndex.map(item => ({
      ...item,
      score: calculateRelevance(queryKeywords, item.keywords, contextConfidence)
    }));

    // Sort by score and take top 3 (require minimum score of 15 for relevance)
    const sortedScored = scored.sort((a, b) => b.score - a.score);
    const topMatches = sortedScored
      .filter(item => item.score >= 15)
      .slice(0, 3);

    // Track max score from ALL results (after sorting)
    const maxScore = sortedScored.length > 0 ? sortedScored[0].score : 0;

    if (topMatches.length === 0) {
      console.log('  ⚠️  No relevant pages found (no scores >= 15)');
      const topScored = sortedScored.slice(0, 3);
      console.log('  Top scores were:', topScored.map(m => ({ url: m.url, score: m.score })));
      return { found: false, results: [], maxScore: maxScore };
    }

    console.log('  ✅ Top matches:', topMatches.map(m => ({ url: m.url, score: m.score })));

    // Fetch content from matched pages
    console.log('  Fetching page content...');
    const results = [];
    for (const match of topMatches) {
      try {
        const pageResponse = await fetch(match.url);
        if (pageResponse.ok) {
          const pageHtml = await pageResponse.text();

          // Extract text content (basic extraction)
          const textContent = pageHtml
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 1500);

          // Extract title
          const titleMatch = pageHtml.match(/<title>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';

          results.push({
            url: match.url,
            title: title,
            content: textContent
          });

          console.log(`    ✅ Fetched: ${title}`);
        }
      } catch (err) {
        console.warn(`    ⚠️  Failed to fetch ${match.url}:`, err.message);
      }
    }

    console.log(`✅ Search complete: found ${results.length} result(s)`);

    return {
      found: results.length > 0,
      results: results,
      maxScore: maxScore
    };
  } catch (error) {
    console.error('❌ Error in searchHelpMoveworks:', error);
    console.error('   Stack:', error.stack);
    return { found: false, results: [], maxScore: 0 };
  }
}

// Function to call Claude API
async function handleClaudeRequest(userMessage, pageContext, selectedElement = null) {
  // Get API key from Chrome storage
  const storage = await chrome.storage.local.get(['claudeApiKey']);
  const apiKey = storage.claudeApiKey;

  if (!apiKey) {
    throw new Error('API key not found. Please add your Claude API key in the extension settings.');
  }

  // Debug logging to verify context is received
  console.log('Page Context received:', JSON.stringify(pageContext, null, 2));

  // Build adaptive search query based on user intent
  let searchQuery = '';
  const userKeywords = extractKeywords(userMessage);
  const meaningfulKeywords = userKeywords.filter(kw => kw.length >= 3);

  // Strategy 1: If user has specific keywords (>=2), prioritize them
  // This handles off-page queries like "What is ticket routing?"
  if (meaningfulKeywords.length >= 2) {
    searchQuery = meaningfulKeywords.join(' ');
  }
  // Strategy 2: Generic question - use page context
  // This handles on-page queries like "What is this page?"
  else if (pageContext) {
    const pageTitle = pageContext.title || '';
    const mainHeading = pageContext.mainContentHeadings && pageContext.mainContentHeadings.length > 0
      ? pageContext.mainContentHeadings[0].text
      : '';
    const currentStepText = pageContext.currentStep || '';
    const activeNav = pageContext.activeNavItem || '';

    searchQuery = `${mainHeading} ${pageTitle} ${activeNav} ${currentStepText}`.trim();
  }
  // Strategy 3: Fallback - use original user message
  else {
    searchQuery = userMessage;
  }

  console.log('Built search query:', searchQuery);

  // Detect better elements to suggest when current element is too generic
  function findBetterElements(selectedElement) {
    if (!selectedElement) return [];

    // Only suggest for generic buttons
    const genericButtons = /^(create|edit|delete|save|cancel|submit|add|remove|new|close|open)$/i;
    if (selectedElement.tag !== 'button' || !genericButtons.test(selectedElement.text || '')) {
      return [];
    }

    const suggestions = [];

    // Check siblings for help text or icons
    if (selectedElement.siblings?.next?.isHelpText) {
      suggestions.push({
        type: 'sibling-help',
        description: 'help text near this button',
        priority: 10
      });
    }

    // Check if button opens a form (suggest form fields based on page/section context)
    if (selectedElement.nearestHeader) {
      suggestions.push({
        type: 'form-fields',
        description: `form fields in the "${selectedElement.nearestHeader}" section`,
        priority: 8
      });
    }

    // Suggest table headers if button is near table/list context
    if (selectedElement.parent?.classes.some(c => /table|list|grid/i.test(c))) {
      suggestions.push({
        type: 'table-content',
        description: 'column headers or existing items in the table',
        priority: 5
      });
    }

    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 2);
  }

  // Extract priority-based keywords from selected element (Point & Ask feature)
  function getElementKeywords(selectedElement) {
    const keywords = [];

    // TIER 1: Human-readable semantic (weight: 3)
    if (selectedElement.label) {
      keywords.push({ text: selectedElement.label, weight: 3, source: 'label' });
    }
    if (selectedElement.placeholder) {
      keywords.push({ text: selectedElement.placeholder, weight: 3, source: 'placeholder' });
    }
    if (selectedElement.ariaDescribedBy) {
      keywords.push({ text: selectedElement.ariaDescribedBy, weight: 3, source: 'aria' });
    }
    if (selectedElement.siblings?.next?.isHelpText) {
      keywords.push({ text: selectedElement.siblings.next.text, weight: 3, source: 'help-text' });
    }
    if (selectedElement.siblings?.previous?.isHelpText) {
      keywords.push({ text: selectedElement.siblings.previous.text, weight: 3, source: 'help-text' });
    }
    if (selectedElement.nearestHeader) {
      keywords.push({ text: selectedElement.nearestHeader, weight: 3, source: 'header' });
    }

    // TIER 2: Semantic attributes (weight: 2)
    if (selectedElement.text) {
      keywords.push({ text: selectedElement.text, weight: 2, source: 'text' });
    }
    if (selectedElement.attributes?.name && !/^\d+$|^field_\d+$/.test(selectedElement.attributes.name)) {
      keywords.push({ text: selectedElement.attributes.name.replace(/_/g, ' '), weight: 2, source: 'name' });
    }
    if (selectedElement.attributes?.title) {
      keywords.push({ text: selectedElement.attributes.title, weight: 2, source: 'title' });
    }

    // TIER 3: Technical identifiers (weight: 1) - only if semantic
    if (selectedElement.id && !/^\d+$|^uuid-|^field-\d+/.test(selectedElement.id)) {
      keywords.push({ text: selectedElement.id.replace(/-/g, ' '), weight: 1, source: 'id' });
    }

    // Parent context (weight: 2)
    if (selectedElement.parent?.classes && selectedElement.parent.classes.length > 0) {
      const parentText = selectedElement.parent.classes.join(' ').replace(/-/g, ' ');
      keywords.push({ text: parentText, weight: 2, source: 'parent' });
    }

    return keywords
      .filter(k => k.text && k.text.length > 2)
      .sort((a, b) => b.weight - a.weight);
  }

  // Tiered search logic: element-specific → page-level → no docs
  let helpDocs = { found: false, results: [], maxScore: 0 };
  let searchTier = null;
  const searchStartTime = performance.now();

  // TIER 1: Element-specific search (if Point & Ask used)
  if (selectedElement) {
    const elementKeywords = getElementKeywords(selectedElement);
    console.log('🔍 [SEARCH] Element keywords extracted:', elementKeywords.map(k => `${k.text} (${k.source}, weight:${k.weight})`));

    // Try high-priority keywords (weight 3)
    const tier1Keywords = elementKeywords.filter(k => k.weight === 3).map(k => k.text);
    if (tier1Keywords.length > 0) {
      const tier1Query = tier1Keywords.join(' ');
      helpDocs = await searchHelpMoveworks(tier1Query, selectedElement, pageContext);
      if (helpDocs.found && helpDocs.maxScore >= 15) {
        searchTier = 'element-tier1';
        console.log(`🔍 [SEARCH] Tier 1 (element high-priority): Found ${helpDocs.results.length} results (max score: ${helpDocs.maxScore})`);
      }
    }

    // Try medium-priority keywords (weight 2-3) if tier 1 failed
    if ((!helpDocs.found || helpDocs.maxScore < 15) && elementKeywords.filter(k => k.weight >= 2).length > 0) {
      const tier2Keywords = elementKeywords.filter(k => k.weight >= 2).map(k => k.text);
      const tier2Query = tier2Keywords.slice(0, 5).join(' ');  // Limit to 5 keywords max
      helpDocs = await searchHelpMoveworks(tier2Query, selectedElement, pageContext);
      if (helpDocs.found && helpDocs.maxScore >= 15) {
        searchTier = 'element-tier2';
        console.log(`🔍 [SEARCH] Tier 2 (element medium-priority): Found ${helpDocs.results.length} results (max score: ${helpDocs.maxScore})`);
      }
    }
  }

  // TIER 2: Page-level search (if element search failed or no element selected)
  if (!helpDocs.found || helpDocs.maxScore < 15) {
    helpDocs = await searchHelpMoveworks(searchQuery, selectedElement, pageContext);
    if (helpDocs.found && helpDocs.maxScore >= 15) {
      searchTier = 'page-level';
      console.log(`🔍 [SEARCH] Tier 3 (page-level): Found ${helpDocs.results.length} results (max score: ${helpDocs.maxScore})`);
    } else {
      searchTier = 'no-docs';
      console.log(`⚠️ [SEARCH] No documentation found (max score: ${helpDocs.maxScore || 0})`);
    }
  }

  const searchDuration = performance.now() - searchStartTime;
  console.log(`🔍 Search took ${searchDuration.toFixed(0)}ms using tier: ${searchTier}`);

  // Build context-aware system prompt
  let systemPrompt = `You are the Moveworks Setup Assistant, helping users complete their Moveworks setup process.

CRITICAL: The user is CURRENTLY on a specific setup page. Your primary job is to help them with THIS PAGE and THIS STEP.

CURRENT PAGE CONTEXT (THIS IS WHERE THE USER IS RIGHT NOW):
`;

  // Add page context first and prominently
  if (pageContext) {
    systemPrompt += `
**NAVIGATION LOCATION:**
- Navigation Path: ${pageContext.navigationPath.length > 0 ? pageContext.navigationPath.join(' > ') : 'Unknown'}
- Current Section: ${pageContext.activeNavItem || 'Unknown'}
- Parent Section: ${pageContext.navigationSectionActive || 'Unknown'}

**PAGE STRUCTURE:**
- Page URL: ${pageContext.url}
- Page Title: ${pageContext.title}
- Page Type: ${pageContext.pageType || 'content'}
- Current Step: ${pageContext.currentStep || 'Not identified'}

**TABS (if applicable):**
- Active Tab: ${pageContext.activeTabs.length > 0 ? pageContext.activeTabs.join(', ') : 'None'}
- Available Tabs: ${pageContext.availableTabs.length > 0 ? pageContext.availableTabs.join(', ') : 'None'}

**MAIN CONTENT:**
- Primary Heading: ${pageContext.mainContentHeadings.length > 0 ? pageContext.mainContentHeadings[0].text : 'Unknown'}
- All Headings: ${pageContext.mainContentHeadings.map(h => `${h.level.toUpperCase()}: "${h.text}"`).join(' | ') || 'None'}
- Sections: ${pageContext.sections.map(s => s.header).join(', ') || 'None'}

**FORMS & WIDGETS:**
- Form Fields: ${pageContext.formFields.length > 0 ? pageContext.formFields.join(', ') : 'None'}
- Widgets Detected: ${pageContext.widgets.length} widget(s)
${pageContext.widgets.length > 0 ? pageContext.widgets.slice(0, 3).map(w => {
  if (w.type === 'table') {
    return `  - Table with columns: ${w.columns.join(', ')}`;
  } else if (w.type === 'card') {
    return `  - Card: ${w.title} ${w.value ? `(${w.value})` : ''}`;
  }
  return `  - ${w.type}`;
}).join('\n') : ''}

**CONTENT PREVIEW:**
${pageContext.mainContentText ? pageContext.mainContentText.substring(0, 500) : 'Not available'}

INSTRUCTIONS FOR USING THIS CONTEXT:
1. **FIRST**, understand the user's location: They are at "${pageContext.navigationPath.join(' > ')}"
2. **SECOND**, understand what they're viewing: ${pageContext.activeTabs.length > 0 ? `"${pageContext.activeTabs[0]}" tab` : `"${pageContext.mainContentHeadings[0]?.text || 'this page'}"`}
3. **THIRD**, interpret their question in the context of THIS specific page, section, and tab
4. **FOURTH**, provide specific, actionable help relevant to what they can SEE on their current page
5. Reference specific headings, sections, form fields, or table columns that are visible to them
6. If they ask about navigation or "where am I?", use the Navigation Path above

`;
  } else {
    systemPrompt += `(Page context not available - provide general setup guidance)

`;
  }

  // Add selected element context if available (Point & Ask feature)
  if (selectedElement) {
    // Build sibling context string
    let siblingContext = '';
    if (selectedElement.siblings.count > 0) {
      siblingContext = `- Siblings: ${selectedElement.siblings.position} of ${selectedElement.siblings.count} sibling elements\n`;
      if (selectedElement.siblings.previous) {
        siblingContext += `  - Previous: <${selectedElement.siblings.previous.tag}>${selectedElement.siblings.previous.classes.length > 0 ? ` class="${selectedElement.siblings.previous.classes.join(' ')}"` : ''}${selectedElement.siblings.previous.text ? ` text="${selectedElement.siblings.previous.text}"` : ''}\n`;
      }
      if (selectedElement.siblings.next) {
        siblingContext += `  - Next: <${selectedElement.siblings.next.tag}>${selectedElement.siblings.next.classes.length > 0 ? ` class="${selectedElement.siblings.next.classes.join(' ')}"` : ''}${selectedElement.siblings.next.text ? ` text="${selectedElement.siblings.next.text}"` : ''}\n`;
      }
    }

    // Build children context string
    let childrenContext = '';
    if (selectedElement.children.count > 0) {
      childrenContext = `- Child Elements: ${selectedElement.children.count} children\n`;
      selectedElement.children.elements.forEach(child => {
        childrenContext += `  - <${child.tag}>${child.classes.length > 0 ? ` class="${child.classes.join(' ')}"` : ''}${child.text ? ` text="${child.text}"` : ''}\n`;
      });
    }

    systemPrompt += `
🎯 **SELECTED ELEMENT (Point & Ask):**
The user has specifically selected an element on the page using Point & Ask. This element should be given PRIORITY in your response.

**Element Details:**
- Tag: <${selectedElement.tag}>${selectedElement.id ? ` id="${selectedElement.id}"` : ''}${selectedElement.classes.length > 0 ? ` class="${selectedElement.classes.join(' ')}"` : ''}
- Role: ${selectedElement.role || 'Not specified'}
- Visible Text: ${selectedElement.text ? `"${selectedElement.text.substring(0, 300)}${selectedElement.text.length > 300 ? '...' : ''}"` : 'None'}
- Placeholder/Label: ${selectedElement.placeholder || 'None'}
- Type: ${selectedElement.attributes?.type || 'Not specified'}
- Dimensions: ${selectedElement.dimensions.width}x${selectedElement.dimensions.height}px
${selectedElement.attributes?.href ? `- Link Target: ${selectedElement.attributes.href}\n` : ''}${selectedElement.attributes?.name ? `- Field Name: ${selectedElement.attributes.name}\n` : ''}- Parent Element: <${selectedElement.parent.tag}> ${selectedElement.parent.classes.length > 0 ? `class="${selectedElement.parent.classes.join(' ')}"` : ''}
${siblingContext}${childrenContext}- HTML Snippet: ${selectedElement.htmlSnippet.substring(0, 1000)}${selectedElement.htmlSnippet.length > 1000 ? '...' : ''}

**Instructions for Selected Element:**
1. The user's question is SPECIFICALLY about this element - focus your answer on it
2. Use the element's text, attributes, and context to provide precise, targeted help
3. If the element is a form field, explain what input is expected
4. If it's a button, explain what action it performs
5. If it's a link, explain where it leads
6. Reference this element explicitly in your response (e.g., "The Save button you selected...")
7. Use the sibling and child element context to provide richer explanations about the element's purpose and relationships

`;
  }

  // Detect if query is about off-page topic and add conditional instructions
  const isOffPageQuery = detectOffPageQuery(pageContext, helpDocs, userKeywords);
  if (isOffPageQuery && helpDocs.found && helpDocs.results.length > 0) {
    systemPrompt += `
⚠️ IMPORTANT - OFF-PAGE QUERY DETECTED:
The user's question appears to be about a DIFFERENT topic than their current page. The documentation below is about a different feature or section.

HOW TO RESPOND TO OFF-PAGE QUERIES:
1. **Acknowledge the difference first**: Start your response with "I see you're asking about [topic from documentation], which is a different feature from the [current page name] page you're currently on."

2. **Answer their question**: Provide a clear, helpful answer using the documentation below. Cite sources normally with [1], [2], etc.

3. **Optional - Suggest navigation**: If you can infer where this feature might be found in the navigation, mention it: "You can typically find this under [navigation path]."

IMPORTANT: Do NOT try to force-fit the documentation into the context of their current page. Treat this as a separate question about a different feature.

`;
  }

  systemPrompt += `
HELP DOCUMENTATION RULES:
1. **ALWAYS cite documentation sources** when answering questions using the provided help documentation below
2. Use numbered references in your response like this: "According to the documentation [1], you should..." or "This feature is described in [2]"
3. At the END of your response, include a "Sources:" section that lists the URLs:

   Sources:
   [1] https://help.moveworks.com/...
   [2] https://help.moveworks.com/...

4. If documentation doesn't fully answer their question, STILL cite what you used, then add contextual guidance based on the current page
5. If NO documentation is provided below, start with: "I don't have specific documentation for this, but based on your current page..."
6. Keep responses clear, concise, and focused on helping them complete THIS step

`;

  // Add help documentation if found with high confidence (score >= 15)
  if (helpDocs.found && helpDocs.results.length > 0 && helpDocs.maxScore >= 15) {
    systemPrompt += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 OFFICIAL MOVEWORKS DOCUMENTATION (found via ${searchTier})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have ${helpDocs.results.length} documentation source(s) available below.

⚠️ STRICT DOCUMENTATION-ONLY POLICY:
- Answer EXCLUSIVELY using the documentation content below
- EVERY factual statement MUST have an inline [1], [2], or [3] citation immediately after it
- If the documentation does NOT explicitly answer the question, you MUST say: "The documentation I found covers [brief topic], but doesn't specifically address [user's question]. Please consult your Moveworks administrator."
- DO NOT add information from general knowledge, make assumptions, or infer beyond what's explicitly written
- DO NOT use phrases like "appears to", "likely", "probably", "seems to", "suggests" - only state what's explicitly documented

📄 DOCUMENTATION SOURCES:

`;
    helpDocs.results.forEach((doc, index) => {
      systemPrompt += `[${index + 1}] ${doc.url}
Title: ${doc.title}
Content: ${doc.content}

`;
    });
  } else if (helpDocs.found && helpDocs.maxScore >= 5 && helpDocs.maxScore < 15) {
    // Low-confidence results - show as "Related Resources"
    systemPrompt += `
⚠️ LOW-CONFIDENCE SEARCH RESULTS
I found some documentation related to ${selectedElement ? 'this element' : 'your question'}, but it may not directly address your specific need (relevance score: ${helpDocs.maxScore}/15).

**Related Resources** (for reference):
${helpDocs.results.slice(0, 3).map((doc, i) => `[${i + 1}] ${doc.title} - ${doc.url}`).join('\n')}

INSTRUCTIONS FOR RESPONDING:
1. Acknowledge: "I found some related documentation, but it may not specifically cover ${selectedElement ? `the '${selectedElement.label || selectedElement.text || selectedElement.tag}' ${selectedElement.tag}` : 'this exact topic'}."
2. Briefly summarize what the related docs cover (1-2 sentences max)
3. Provide the Related Resources list above
4. End with: "For specific guidance, I recommend consulting your Moveworks administrator or reviewing the related resources above."

DO NOT:
- Claim the docs directly answer the question
- Use general knowledge to fill gaps
- Provide step-by-step instructions not in the docs

`;
  } else {
    // Check if element has help text available
    const hasHelpText = selectedElement && (
      selectedElement.siblings?.next?.isHelpText ||
      selectedElement.siblings?.previous?.isHelpText ||
      selectedElement.ariaDescribedBy
    );

    if (hasHelpText) {
      const helpTextContent = selectedElement.ariaDescribedBy ||
                             (selectedElement.siblings?.next?.isHelpText ? selectedElement.siblings.next.text : selectedElement.siblings.previous.text);

      systemPrompt += `
⚠️ NO OFFICIAL DOCUMENTATION FOUND
No relevant documentation exists in help.moveworks.com for this specific element.

📝 ON-PAGE HELP TEXT AVAILABLE:
The page interface contains the following guidance:
"${helpTextContent}"

INSTRUCTIONS FOR RESPONDING WITHOUT DOCUMENTATION:
1. Start your response with: "⚠️ **Note**: I don't have official Moveworks documentation for the '${selectedElement.label || selectedElement.text || selectedElement.tag}' ${selectedElement.tag === 'input' || selectedElement.tag === 'select' || selectedElement.tag === 'textarea' ? 'field' : 'element'}."
2. Quote the on-page help text and clearly state: "Based on the information visible on this page, [quote help text]"
3. Provide interpretation ONLY based on the quoted text - DO NOT add external knowledge or general assumptions
4. End with: "**Important**: This is inferred from the page interface, not official documentation. Please verify with your Moveworks administrator or consult your organization's configuration guidelines to ensure accurate setup."

DO NOT:
- Use general AI knowledge about enterprise software
- Make assumptions beyond what's stated in the help text
- Provide specific configuration values unless explicitly shown in help text

`;
    } else {
      // Check for better element suggestions (generic buttons only)
      const betterElements = findBetterElements(selectedElement);
      const suggestionsText = betterElements.length > 0 ? `

**Suggestion**: For more detailed help, try using Point & Ask on:
${betterElements.map(s => `- ${s.description.charAt(0).toUpperCase() + s.description.slice(1)}`).join('\n')}

These elements often have more specific documentation available.
` : '';

      systemPrompt += `
⚠️ NO DOCUMENTATION OR HELP TEXT AVAILABLE
No relevant documentation exists in help.moveworks.com, and no help text is visible on the page for this ${selectedElement ? 'element' : 'topic'}.

INSTRUCTIONS FOR RESPONDING WITHOUT ANY DOCUMENTATION:
You must fully defer to the user's administrator. Respond with:

"I don't have official Moveworks documentation for ${selectedElement ? `the '${selectedElement.label || selectedElement.text || selectedElement.tag}' ${selectedElement.tag === 'input' || selectedElement.tag === 'select' || selectedElement.tag === 'textarea' ? 'field' : 'element'}` : 'this topic'}.${suggestionsText}

For accurate configuration guidance, I recommend:
- Consulting your Moveworks administrator
- Reviewing your organization's internal Moveworks documentation
- Contacting Moveworks support

This ensures you configure ${selectedElement ? 'this field' : 'this feature'} correctly for your organization's specific setup."

DO NOT:
- Provide guidance based on general knowledge
- Make inferences from field names or page context
- Suggest configuration approaches without documentation

`;
    }
  }

  // Add final reminder about citations (enhanced with search tier info and strict requirements)
  if (helpDocs.found && helpDocs.results.length > 0 && helpDocs.maxScore >= 15) {
    systemPrompt += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CRITICAL RESPONSE REQUIREMENTS 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have ${helpDocs.results.length} documentation source(s) above (found via ${searchTier}).

**MANDATORY RULES - NO EXCEPTIONS:**

1. **DOCUMENTATION-ONLY RESPONSES**:
   - Use EXCLUSIVELY the documentation content provided above
   - If the documentation doesn't explicitly answer the user's question, acknowledge this immediately
   - NEVER fill gaps with general AI knowledge

2. **INLINE CITATIONS REQUIRED**:
   - EVERY sentence with factual information MUST have [1], [2], or [3] immediately after it
   - Example: "This creates a new configuration [1]."
   - NO speculative language: "appears to", "likely", "probably", "seems to", "suggests"

3. **SOURCES SECTION MANDATORY**:
   - End with "**Sources:**" section
   - List ALL citations with full URLs
   - Format: "[1] Title - https://help.moveworks.com/..."

4. **IF DOCUMENTATION DOESN'T ANSWER THE QUESTION**:
   - Say: "The documentation I found covers [what it covers], but doesn't specifically explain [what user asked]. Please consult your Moveworks administrator for guidance on [specific question]."
   - DO NOT attempt to answer anyway with general knowledge

5. **RELEVANCE CHECK**:
   - Before responding, verify the documentation actually answers the user's question
   - If documentation is about a different topic, acknowledge the mismatch
   - Example: "The documentation I found is about Slack integration specifically, but doesn't explain the Create New button functionality for Enterprise Search in general."

${selectedElement ? `6. **ELEMENT-SPECIFIC FOCUS**:
   - The user asked about: ${selectedElement.label || selectedElement.text || selectedElement.tag}
   - If documentation doesn't cover THIS specific element, say so\n` : ''}
**CORRECT RESPONSE EXAMPLE:**
"This button creates a new Enterprise Search configuration [1]. You'll need to provide the system name and authentication credentials [1]. The configuration process is documented in the setup guide [2].

**Sources:**
[1] Enterprise Search Setup - https://help.moveworks.com/...
[2] Configuration Guide - https://help.moveworks.com/..."

**INCORRECT RESPONSE EXAMPLE (DO NOT DO THIS):**
"This button appears to create a new configuration. You'll likely be taken to a setup screen where you can configure various systems. Based on the page context, this seems to allow you to..."
(This violates: speculative language, no citations, using general knowledge)
`;
  }

  // Add final override section to clarify precedence (applies to ALL cases)
  systemPrompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 FINAL OVERRIDE - DOCUMENTATION PRECEDENCE 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL INSTRUCTION HIERARCHY:**

${helpDocs.found && helpDocs.maxScore >= 15 ? `
✅ You have HIGH-CONFIDENCE documentation (score: ${helpDocs.maxScore}/15)
→ Answer EXCLUSIVELY from the documentation provided above
→ EVERY sentence must cite [1], [2], or [3]
→ MANDATORY: End with "**Sources:**" section listing all citations
→ If docs don't answer the question, acknowledge and defer to admin
→ IGNORE page context for factual claims - use ONLY documented information
` : helpDocs.found && helpDocs.maxScore >= 5 ? `
⚠️ You have LOW-CONFIDENCE documentation (score: ${helpDocs.maxScore}/15)
→ Acknowledge docs may not directly address the question
→ Briefly mention what the related docs cover (1-2 sentences)
→ List Related Resources above
→ Defer to Moveworks administrator for specific guidance
→ DO NOT use page context or general knowledge to answer
` : `
❌ NO DOCUMENTATION FOUND (score: ${helpDocs.maxScore || 0}/15)
→ You MUST fully defer to the user's administrator
→ DO NOT use the page context to answer the question
→ DO NOT use general AI knowledge about Moveworks or enterprise software
→ DO NOT infer from field names, page structure, or visible elements
→ Respond ONLY with: "I don't have official Moveworks documentation for [topic]. Please consult your Moveworks administrator."
`}

**PAGE CONTEXT RULE:**
The page context provided earlier is for YOUR understanding of where the user is located.
${helpDocs.found && helpDocs.maxScore >= 15 ?
  'You may reference visible page elements (headings, buttons, fields) to clarify WHAT the user is asking about, but factual answers must come from documentation only.' :
  'DO NOT use it to answer questions. It is for context only, not for generating answers.'}

**REMINDER:**
- Documentation precedence: Official docs > On-page help text > Defer to admin
- NEVER use general knowledge when docs are unavailable
- When in doubt, defer to administrator

`;

  // Call Claude API with 30-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

  const apiStartTime = performance.now();
  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userMessage }],
        system: systemPrompt
      })
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds. Please check your connection and try again.');
    }
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();

  const apiDuration = performance.now() - apiStartTime;
  console.log(`⏱️ API call took ${apiDuration.toFixed(0)}ms`);

  // Extract text from Claude's response
  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text;
  } else {
    throw new Error('Unexpected response format from Claude API');
  }
}
