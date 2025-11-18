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

// Helper: Calculate relevance score
function calculateRelevance(queryKeywords, urlKeywords) {
  let score = 0;

  // Exact keyword matches
  queryKeywords.forEach(qk => {
    if (urlKeywords.includes(qk)) {
      score += 10;
    }
  });

  // Partial matches (substring matching)
  queryKeywords.forEach(qk => {
    urlKeywords.forEach(uk => {
      if (uk.includes(qk) || qk.includes(uk)) {
        score += 5;
      }
    });
  });

  // Boost for docs vs other sections
  if (urlKeywords.includes('docs')) score += 2;

  // Penalize very deep URLs (prefer overview pages)
  if (urlKeywords.length > 6) score -= 2;

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
async function searchHelpMoveworks(query) {
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

    // Score each URL by relevance
    const scored = searchIndex.map(item => ({
      ...item,
      score: calculateRelevance(queryKeywords, item.keywords)
    }));

    // Sort by score and take top 3 (require minimum score of 15 for relevance)
    const topMatches = scored
      .filter(item => item.score >= 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topMatches.length === 0) {
      console.log('  ⚠️  No relevant pages found (no scores >= 15)');
      const topScored = scored.sort((a, b) => b.score - a.score).slice(0, 3);
      console.log('  Top scores were:', topScored.map(m => ({ url: m.url, score: m.score })));
      return { found: false, results: [] };
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
      results: results
    };
  } catch (error) {
    console.error('❌ Error in searchHelpMoveworks:', error);
    console.error('   Stack:', error.stack);
    return { found: false, results: [] };
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

  // Search help.moveworks.com for relevant content
  const searchStartTime = performance.now();
  const helpDocs = await searchHelpMoveworks(searchQuery);
  const searchDuration = performance.now() - searchStartTime;
  console.log(`🔍 Search took ${searchDuration.toFixed(0)}ms, found ${helpDocs.results.length} results`);

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
    systemPrompt += `
🎯 **SELECTED ELEMENT (Point & Ask):**
The user has specifically selected an element on the page using Point & Ask. This element should be given PRIORITY in your response.

**Element Details:**
- Tag: <${selectedElement.tag}>${selectedElement.id ? ` id="${selectedElement.id}"` : ''}${selectedElement.classes.length > 0 ? ` class="${selectedElement.classes.join(' ')}"` : ''}
- Role: ${selectedElement.role || 'Not specified'}
- Visible Text: ${selectedElement.text ? `"${selectedElement.text.substring(0, 200)}${selectedElement.text.length > 200 ? '...' : ''}"` : 'None'}
- Placeholder/Label: ${selectedElement.placeholder || 'None'}
- Type: ${selectedElement.attributes?.type || 'Not specified'}
- Dimensions: ${selectedElement.dimensions.width}x${selectedElement.dimensions.height}px
${selectedElement.attributes?.href ? `- Link Target: ${selectedElement.attributes.href}` : ''}
${selectedElement.attributes?.name ? `- Field Name: ${selectedElement.attributes.name}` : ''}
- Parent Element: <${selectedElement.parent.tag}> ${selectedElement.parent.classes.length > 0 ? `class="${selectedElement.parent.classes.join(' ')}"` : ''}
- HTML Snippet: ${selectedElement.htmlSnippet.substring(0, 300)}${selectedElement.htmlSnippet.length > 300 ? '...' : ''}

**Instructions for Selected Element:**
1. The user's question is SPECIFICALLY about this element - focus your answer on it
2. Use the element's text, attributes, and context to provide precise, targeted help
3. If the element is a form field, explain what input is expected
4. If it's a button, explain what action it performs
5. If it's a link, explain where it leads
6. Reference this element explicitly in your response (e.g., "The Save button you selected...")

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

  // Add help documentation if found
  if (helpDocs.found && helpDocs.results.length > 0) {
    systemPrompt += `\nRELEVANT HELP.MOVEWORKS.COM DOCUMENTATION:
You have ${helpDocs.results.length} documentation source(s) available. Reference them using [1], [2], [3] in your response.

`;
    helpDocs.results.forEach((doc, index) => {
      systemPrompt += `[${index + 1}] ${doc.url}
Title: ${doc.title}
Content: ${doc.content}

`;
    });
  } else {
    systemPrompt += `\nNOTE: No relevant documentation was found on help.moveworks.com for this query. Since you have the page context above, provide helpful guidance based on what you can see on their current page (headings, form fields, visible content). Start your response with: "I don't have specific documentation for this, but based on your current page..."

`;
  }

  // Add final reminder about citations
  if (helpDocs.found && helpDocs.results.length > 0) {
    systemPrompt += `\n
REMINDER: You have ${helpDocs.results.length} documentation source(s) above. YOU MUST include citations in your response:
- Use [1], [2], [3] references in your text
- Add a "Sources:" section at the end listing the full URLs
`;
  }

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
