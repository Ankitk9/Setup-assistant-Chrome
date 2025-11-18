console.log("🚀 Moveworks Setup Assistant content script loading...");

// SVG Icons
const moveworksIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_164_25240)">
<path d="M13.0767 3H10.9865C10.5536 3 10.2023 3.35133 10.2023 3.78428V5.0654L8.04823 3H5.95808C5.52514 3 5.17383 3.35133 5.17383 3.78428V10.4276H6.40521V4.23143H7.55497L10.2058 6.77237V10.4276H11.4372V7.95057L14.0206 10.4276H15.7985L11.4372 6.24715V4.23143H12.587L19.0171 10.3957L19.049 10.4276H20.8269L13.0767 3Z" fill="currentColor"/>
<path d="M19.042 13.5713L12.5799 19.7675H11.4301V17.7518L15.5891 13.7665L15.7914 13.5748H14.0135L11.4301 16.0519V13.5748H10.1987V17.2301L7.55142 19.7675H6.40166V13.5713H5.17383V20.2146C5.17383 20.6476 5.52514 20.9989 5.95808 20.9989H8.04823L10.2023 18.9335V20.2146C10.2023 20.6476 10.5536 20.9989 10.9865 20.9989H13.0767L20.6211 13.7665L20.8234 13.5748H19.0455L19.042 13.5713Z" fill="currentColor"/>
</g>
<defs>
<clipPath id="clip0_164_25240">
<rect width="15.6531" height="17.9989" fill="white" transform="translate(5.17383 3)"/>
</clipPath>
</defs>
</svg>`;

const minimizeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.3333 11H4.66667C4.29848 11 4 11.4477 4 12C4 12.5523 4.29848 13 4.66667 13H19.3333C19.7015 13 20 12.5523 20 12C20 11.4477 19.7015 11 19.3333 11Z" fill="currentColor"/>
</svg>`;

const maximizeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="5.8" y="4.8" width="13.4" height="14.4" rx="3.2" stroke="currentColor" stroke-width="1.6"/>
</svg>`;

const trashIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.9043 3.25C15.2536 3.25121 15.5889 3.38767 15.8359 3.63086C16.0829 3.87406 16.2223 4.20392 16.2236 4.54785V11.5391H16.3877C16.8403 11.5392 17.2747 11.7171 17.5947 12.0322C17.9146 12.3474 18.0947 12.7751 18.0947 13.2207V14.3027C18.597 15.2393 18.8971 16.268 18.9775 17.3242C19.058 18.3805 18.9173 19.4424 18.5625 20.4424L18.4541 20.75H4.99902V19.8291H8.63281L9.56836 18.1162C10.0922 17.1398 10.5742 16.1356 10.9951 15.127L11.5469 13.8145V13.2207C11.5469 12.7749 11.7268 12.3475 12.0469 12.0322C12.367 11.717 12.8012 11.5391 13.2539 11.5391H13.417V4.54785C13.4183 4.20321 13.5588 3.8732 13.8066 3.62988C14.0547 3.38645 14.391 3.25 14.7412 3.25H14.9043ZM11.8604 15.4775C11.4301 16.5137 10.9343 17.5456 10.3965 18.5449L9.7041 19.8291H11.7197C12.415 18.667 12.9322 17.4097 13.2539 16.0986L14.1611 16.3242C13.8562 17.5433 13.3987 18.7207 12.7998 19.8291H14.8584C15.2359 18.685 15.4498 17.4942 15.4941 16.292H16.4297C16.3955 17.4917 16.1967 18.6816 15.8398 19.8291H17.7812C18.2999 18.0992 18.0997 16.2369 17.2246 14.6523L17.0322 14.3027H12.3555L11.8604 15.4775ZM7.80566 18.4482H5.4668V17.5273H7.80566V18.4482ZM9.20996 15.6846V16.6055H6.87109V15.6846H9.20996ZM13.2539 12.4609C13.0492 12.4609 12.8527 12.5411 12.708 12.6836C12.5635 12.8261 12.4824 13.0193 12.4824 13.2207V13.3818H17.1592V13.2207C17.1592 13.0192 17.0773 12.8261 16.9326 12.6836C16.788 12.5412 16.5922 12.4611 16.3877 12.4609H13.2539ZM14.7363 4.1709C14.6346 4.1709 14.5368 4.21043 14.4648 4.28125C14.3931 4.35196 14.3527 4.44792 14.3525 4.54785V11.5391H15.2832V4.54785C15.2831 4.44784 15.2427 4.35198 15.1709 4.28125C15.0991 4.2106 15.0019 4.171 14.9004 4.1709H14.7363Z" fill="currentColor"/>
</svg>`;

const targetIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<circle cx="12" cy="12" r="10"/>
<circle cx="12" cy="12" r="6"/>
<circle cx="12" cy="12" r="2" fill="currentColor"/>
<line x1="12" y1="2" x2="12" y2="6"/>
<line x1="12" y1="18" x2="12" y2="22"/>
<line x1="2" y1="12" x2="6" y2="12"/>
<line x1="18" y1="12" x2="22" y2="12"/>
</svg>`;

// Create floating toggle button
const toggleButton = document.createElement('button');
toggleButton.id = 'moveworks-toggle-btn';
toggleButton.innerHTML = moveworksIcon;
toggleButton.setAttribute('aria-label', 'Open chat assistant');

// Create chat pane
const chatPane = document.createElement('div');
chatPane.id = 'moveworks-chat-pane';
chatPane.className = 'closed';

// Create pane header
const paneHeader = document.createElement('div');
paneHeader.id = 'moveworks-pane-header';
paneHeader.innerHTML = `
  <div class="header-content">
    <div class="header-icon">${moveworksIcon}</div>
    <h3>Setup Assistant</h3>
  </div>
  <div class="header-buttons">
    <button id="moveworks-clear-btn" class="header-btn" aria-label="Clear chat" title="Clear conversation">${trashIcon}</button>
    <button id="moveworks-inspect-btn" class="header-btn" aria-label="Point & Ask - Select element" title="Point & Ask - Select an element on the page">${targetIcon}</button>
    <button id="moveworks-minimize-btn" class="header-btn" aria-label="Minimize chat">${minimizeIcon}</button>
    <button id="moveworks-close-btn" class="header-btn" aria-label="Close chat">×</button>
  </div>
`;

// Create minimized state buttons container
const minimizedButtons = document.createElement('div');
minimizedButtons.className = 'minimized-buttons';
minimizedButtons.innerHTML = `
  <button id="moveworks-maximize-btn" class="minimized-btn" aria-label="Maximize chat">━━</button>
  <button id="moveworks-close-btn-min" class="minimized-btn" aria-label="Close chat">×</button>
`;

// Create message area
const messageArea = document.createElement('div');
messageArea.id = 'moveworks-message-area';
// Welcome message will be set dynamically on init

// Create input area
const inputArea = document.createElement('div');
inputArea.id = 'moveworks-input-area';
inputArea.innerHTML = `
  <input type="text" id="moveworks-input" placeholder="Ask me anything about this page..." />
  <button id="moveworks-send-btn" aria-label="Send message">→</button>
`;

// Assemble chat pane
chatPane.appendChild(paneHeader);
chatPane.appendChild(messageArea);
chatPane.appendChild(inputArea);
chatPane.appendChild(minimizedButtons);

// Chat state management
let chatState = 'closed'; // 'closed', 'minimized', 'maximized'

// Rate limiting for API calls
let lastSendTime = 0;
const SEND_COOLDOWN = 2000; // 2 seconds

// Context caching for performance
let cachedPageContext = null;
let cachedContextUrl = null;

// Point & Ask feature setting
let pointAndAskEnabled = true;

// Point & Ask state variables
let inspectionModeActive = false;
let selectedElementContext = null;
let inspectionOverlay = null;
let inspectionInstructionBox = null;

// Toggle functions
async function openChat() {
  chatState = 'maximized';
  chatPane.classList.remove('closed', 'minimized');
  chatPane.classList.add('maximized');
  toggleButton.style.display = 'none';
  document.body.style.marginRight = '400px';
  document.body.style.transition = 'margin-right 0.3s ease';

  // Update welcome message and placeholder if no messages yet
  const messageArea = document.getElementById('moveworks-message-area');
  const hasMessages = messageArea.children.length > 1 || !messageArea.querySelector('.welcome-message');

  if (!hasMessages) {
    // Wait for navigation to be available before extracting context
    await waitForNavigation();

    // Clear cache to force fresh extraction
    cachedPageContext = null;
    cachedContextUrl = null;

    const pageContext = extractPageContext();
    const welcomeMsg = generateContextualWelcome(pageContext);
    const welcomeDiv = messageArea.querySelector('.welcome-message');
    if (welcomeDiv) {
      welcomeDiv.innerHTML = parseMarkdown(welcomeMsg);
    }

    // Update placeholder
    const input = document.getElementById('moveworks-input');
    if (input) {
      input.placeholder = generateContextualPlaceholder(pageContext);
    }
  }
}

function minimizeChat() {
  chatState = 'minimized';
  chatPane.classList.remove('closed', 'maximized');
  chatPane.classList.add('minimized');
  toggleButton.style.display = 'none';
  document.body.style.marginRight = '0';
  document.body.style.transition = 'margin-right 0.3s ease';

  // Change minimize button to maximize icon
  const minimizeBtn = document.getElementById('moveworks-minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.innerHTML = maximizeIcon;
    minimizeBtn.setAttribute('aria-label', 'Maximize chat');
    minimizeBtn.removeEventListener('click', minimizeChat);
    minimizeBtn.addEventListener('click', maximizeChat);
  }
}

function maximizeChat() {
  chatState = 'maximized';
  chatPane.classList.remove('closed', 'minimized');
  chatPane.classList.add('maximized');
  toggleButton.style.display = 'none';
  document.body.style.marginRight = '400px';
  document.body.style.transition = 'margin-right 0.3s ease';

  // Change button back to minimize icon
  const minimizeBtn = document.getElementById('moveworks-minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.innerHTML = minimizeIcon;
    minimizeBtn.setAttribute('aria-label', 'Minimize chat');
    minimizeBtn.removeEventListener('click', maximizeChat);
    minimizeBtn.addEventListener('click', minimizeChat);
  }
}

function closeChat() {
  chatState = 'closed';
  chatPane.classList.remove('maximized', 'minimized');
  chatPane.classList.add('closed');
  toggleButton.style.display = 'flex';
  document.body.style.marginRight = '0';
  document.body.style.transition = 'margin-right 0.3s ease';
}

// ========== POINT & ASK CORE FUNCTIONS ==========

// Activate inspection mode
function activateInspectionMode() {
  if (!pointAndAskEnabled) {
    console.warn('🎯 Point & Ask is disabled in settings');
    return;
  }

  inspectionModeActive = true;
  minimizeChat();

  // Add crosshair cursor
  document.body.classList.add('inspection-active');

  // Show instruction box
  createInstructionBox();

  // Add event listeners (capture phase to intercept before page handlers)
  document.addEventListener('mouseover', handleInspectHover, true);
  document.addEventListener('click', handleInspectClick, true);
  document.addEventListener('keydown', handleInspectEscape);

  // Make minimized chat clickable to exit
  const miniChat = document.getElementById('moveworks-chat-pane');
  if (miniChat) {
    miniChat.addEventListener('click', handleMinimizedChatClick);
  }

  console.log('🎯 Inspection mode activated');
}

// Deactivate inspection mode
function deactivateInspectionMode() {
  inspectionModeActive = false;

  // Remove crosshair cursor
  document.body.classList.remove('inspection-active');

  // Remove event listeners
  document.removeEventListener('mouseover', handleInspectHover, true);
  document.removeEventListener('click', handleInspectClick, true);
  document.removeEventListener('keydown', handleInspectEscape);

  // Remove chat click listener
  const miniChat = document.getElementById('moveworks-chat-pane');
  if (miniChat) {
    miniChat.removeEventListener('click', handleMinimizedChatClick);
  }

  // Remove overlay and instruction box
  removeOverlay();
  removeInstructionBox();

  // Maximize chat
  maximizeChat();

  console.log('🎯 Inspection mode deactivated');
}

// Create overlay element
function createOverlay() {
  if (inspectionOverlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'moveworks-inspection-overlay';
  overlay.className = 'inspection-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    background: rgba(255, 155, 138, 0.2);
    border: 2px solid #FF9B8A;
    border-radius: 4px;
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(overlay);
  inspectionOverlay = overlay;
}

// Update overlay position
function updateOverlay(element) {
  if (!inspectionOverlay) createOverlay();

  const rect = element.getBoundingClientRect();
  inspectionOverlay.style.top = rect.top + 'px';
  inspectionOverlay.style.left = rect.left + 'px';
  inspectionOverlay.style.width = rect.width + 'px';
  inspectionOverlay.style.height = rect.height + 'px';
  inspectionOverlay.style.display = 'block';
}

// Remove overlay
function removeOverlay() {
  if (inspectionOverlay) {
    inspectionOverlay.remove();
    inspectionOverlay = null;
  }
}

// Create instruction box (placeholder for Phase 3)
function createInstructionBox() {
  // Remove any existing instruction box
  removeInstructionBox();

  // Create the instruction box
  const instructionBox = document.createElement('div');
  instructionBox.id = 'moveworks-inspection-instructions';
  instructionBox.innerHTML = `
    <div class="instruction-content">
      <div class="instruction-header">
        <span class="instruction-icon">${targetIcon}</span>
        <span class="instruction-title">Point & Ask Mode</span>
      </div>
      <p class="instruction-text">Hover over any element and click to select it</p>
      <div class="instruction-actions">
        <button id="moveworks-exit-inspection-btn" class="exit-inspection-btn">Exit Inspection</button>
      </div>
      <p class="instruction-hint">Or press ESC to exit</p>
    </div>
  `;

  document.body.appendChild(instructionBox);
  inspectionInstructionBox = instructionBox;

  // Attach exit button listener
  const exitBtn = document.getElementById('moveworks-exit-inspection-btn');
  exitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deactivateInspectionMode();
  });

  console.log('🎯 Instruction box displayed');
}

// Remove instruction box
function removeInstructionBox() {
  if (inspectionInstructionBox) {
    inspectionInstructionBox.remove();
    inspectionInstructionBox = null;
  }
}

// Handle mouse hover during inspection
function handleInspectHover(event) {
  if (!inspectionModeActive) return;

  const element = event.target;

  // Ignore extension UI and invisible elements
  if (shouldIgnoreElement(element) || !isElementVisible(element)) {
    removeOverlay();
    return;
  }

  updateOverlay(element);
}

// Handle click during inspection
function handleInspectClick(event) {
  if (!inspectionModeActive) return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target;

  // Ignore extension UI
  if (shouldIgnoreElement(element)) {
    return;
  }

  // Extract and store element context
  selectedElementContext = extractElementContext(element);
  console.log('🎯 Element selected:', selectedElementContext);

  // Deactivate inspection mode and maximize chat
  deactivateInspectionMode();

  // Display element chip above input
  displayElementChip(selectedElementContext);

  // Generate and pre-fill default question
  const defaultQuestion = generateDefaultQuestion(selectedElementContext);
  const input = document.getElementById('moveworks-input');
  if (input) {
    input.value = defaultQuestion;
    input.focus();
    // Select all text so user can easily replace or keep it
    input.select();
  }

  console.log('🎯 Pre-filled question:', defaultQuestion);
}

// Handle ESC key during inspection
function handleInspectEscape(event) {
  if (event.key === 'Escape' && inspectionModeActive) {
    event.preventDefault();
    event.stopPropagation();
    deactivateInspectionMode();
    console.log('🎯 Inspection cancelled via ESC');
  }
}

// Handle click on minimized chat during inspection
function handleMinimizedChatClick(event) {
  if (inspectionModeActive) {
    event.stopPropagation();
    deactivateInspectionMode();
    console.log('🎯 Inspection cancelled via chat click');
  }
}

// Extract element context for AI
function extractElementContext(element) {
  const rect = element.getBoundingClientRect();

  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    classes: Array.from(element.classList).slice(0, 5),
    role: element.getAttribute('role'),
    text: element.innerText?.trim().substring(0, 500) || '',
    placeholder: element.placeholder || element.getAttribute('aria-label'),
    value: element.value?.substring(0, 100),
    attributes: {
      type: element.type,
      name: element.name,
      href: element.href,
      title: element.title,
      ...extractDataAttributes(element)
    },
    parent: {
      tag: element.parentElement?.tagName.toLowerCase(),
      classes: Array.from(element.parentElement?.classList || []).slice(0, 3)
    },
    isVisible: element.offsetParent !== null,
    dimensions: {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    htmlSnippet: sanitizeHtml(element.outerHTML).substring(0, 1000)
  };
}

// Check if element should be ignored
function shouldIgnoreElement(element) {
  // Ignore extension UI
  if (element.id && element.id.startsWith('moveworks-')) return true;
  if (element.closest('#moveworks-chat-pane')) return true;
  if (element.closest('#moveworks-toggle-btn')) return true;
  if (element.closest('#moveworks-inspection-instructions')) return true;
  if (element.closest('#moveworks-inspection-overlay')) return true;

  return false;
}

// Check if element is visible
function isElementVisible(element) {
  // Check offsetParent (null if display:none or parent hidden)
  if (element.offsetParent === null) return false;

  // Check computed style
  const style = window.getComputedStyle(element);
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;

  // Check dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  return true;
}

// Sanitize HTML
function sanitizeHtml(html) {
  return html
    .replace(/\son\w+="[^"]*"/g, '')  // Remove event handlers
    .replace(/\sstyle="[^"]*"/g, '')  // Remove inline styles
    .replace(/<script[^>]*>.*?<\/script>/gi, '');  // Remove scripts
}

// Extract data-* attributes
function extractDataAttributes(element) {
  const dataAttrs = {};
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      // Only include if value is reasonable length
      if (attr.value.length < 100) {
        dataAttrs[attr.name] = attr.value;
      }
    }
  }
  return dataAttrs;
}

// Display selected element as chip above input
function displayElementChip(elementContext) {
  // Remove any existing chip
  removeElementChip();

  // Create chip element
  const chip = document.createElement('div');
  chip.id = 'moveworks-element-chip';
  chip.className = 'element-chip';

  // Create chip content with element info
  const elementLabel = elementContext.text
    ? `${elementContext.tag}: "${elementContext.text.substring(0, 30)}${elementContext.text.length > 30 ? '...' : ''}"`
    : elementContext.placeholder
    ? `${elementContext.tag}: ${elementContext.placeholder}`
    : elementContext.id
    ? `${elementContext.tag}#${elementContext.id}`
    : elementContext.classes.length > 0
    ? `${elementContext.tag}.${elementContext.classes[0]}`
    : elementContext.tag;

  chip.innerHTML = `
    <span class="chip-icon">${targetIcon}</span>
    <span class="chip-label">${elementLabel}</span>
    <button class="chip-remove" aria-label="Remove selected element">×</button>
  `;

  // Insert chip above input area
  const inputArea = document.getElementById('moveworks-input-area');
  inputArea.parentNode.insertBefore(chip, inputArea);

  // Attach remove button listener
  const removeBtn = chip.querySelector('.chip-remove');
  removeBtn.addEventListener('click', removeElementChip);

  console.log('🎯 Element chip displayed:', elementLabel);
}

// Remove element chip
function removeElementChip() {
  const chip = document.getElementById('moveworks-element-chip');
  if (chip) {
    chip.remove();
  }
  selectedElementContext = null;
  console.log('🎯 Element chip removed');
}

// Generate default question based on element type
function generateDefaultQuestion(elementContext) {
  const tag = elementContext.tag;
  const text = elementContext.text;
  const placeholder = elementContext.placeholder;
  const role = elementContext.role;

  // Button elements
  if (tag === 'button' || role === 'button') {
    return text
      ? `What does the "${text}" button do?`
      : 'What does this button do?';
  }

  // Input elements
  if (tag === 'input' || tag === 'textarea') {
    const inputType = elementContext.attributes?.type || 'text';
    if (placeholder) {
      return `What should I enter in the "${placeholder}" field?`;
    }
    return `What is this ${inputType} input for?`;
  }

  // Select/dropdown elements
  if (tag === 'select' || role === 'listbox' || role === 'combobox') {
    return text
      ? `What are the options for "${text}"?`
      : 'What are the available options in this dropdown?';
  }

  // Link elements
  if (tag === 'a') {
    return text
      ? `Where does the "${text}" link go?`
      : 'What does this link do?';
  }

  // Form elements
  if (tag === 'form') {
    return 'What information is needed for this form?';
  }

  // Table elements
  if (tag === 'table' || role === 'table') {
    return 'What data is shown in this table?';
  }

  // Image elements
  if (tag === 'img') {
    const alt = elementContext.attributes?.alt;
    return alt
      ? `What is the "${alt}" image for?`
      : 'What is this image showing?';
  }

  // Checkbox/radio elements
  if (role === 'checkbox' || role === 'radio') {
    return text
      ? `What does the "${text}" option mean?`
      : 'What is this option for?';
  }

  // Generic elements with text
  if (text && text.length > 0) {
    const shortText = text.substring(0, 40);
    return `What does "${shortText}${text.length > 40 ? '...' : ''}" mean?`;
  }

  // Generic fallback based on role
  if (role) {
    return `What is this ${role} used for?`;
  }

  // Ultimate fallback
  return `What is this ${tag} element for?`;
}

// ========== END POINT & ASK CORE FUNCTIONS ==========

// Helper: Wait for navigation element to be available (for React apps)
function waitForNavigation(timeout = 3000) {
  return new Promise((resolve) => {
    const navSelectors = [
      '[class*="navDrawerWrapper"]',
      '.MuiDrawer-root',
      '[role="navigation"]',
      'nav[class*="sidebar"]',
      'aside'
    ];

    // Check if navigation already exists
    for (const selector of navSelectors) {
      if (document.querySelector(selector)) {
        console.log('🔍 [NAV WAIT] Navigation already available');
        resolve(true);
        return;
      }
    }

    console.log('🔍 [NAV WAIT] Navigation not found, waiting for DOM changes...');

    // Use MutationObserver to watch for navigation appearing
    const observer = new MutationObserver(() => {
      for (const selector of navSelectors) {
        if (document.querySelector(selector)) {
          console.log('🔍 [NAV WAIT] Navigation detected via MutationObserver');
          observer.disconnect();
          resolve(true);
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout fallback
    setTimeout(() => {
      console.log('🔍 [NAV WAIT] Timeout reached, proceeding anyway');
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
}

// Helper: Extract navigation hierarchy
function extractNavigationContext() {
  console.log('🔍 [NAV DEBUG] Starting navigation context extraction...');

  const navSelectors = [
    '[class*="navDrawerWrapper"]',  // PRIMARY - 100% success on all 7 pages tested
    '.MuiDrawer-root',              // MUI Drawer component fallback
    '[role="navigation"]',          // ARIA fallback
    'nav[class*="sidebar"]',        // Generic sidebar pattern
    'aside'                          // Semantic fallback
  ];

  let navElement = null;
  let matchedSelector = '';
  for (const selector of navSelectors) {
    navElement = document.querySelector(selector);
    if (navElement) {
      matchedSelector = selector;
      console.log(`🔍 [NAV DEBUG] Navigation element found with selector: "${matchedSelector}"`);
      break;
    }
  }

  if (!navElement) {
    console.log('🔍 [NAV DEBUG] ❌ No navigation element found! Returning empty context.');
    return { path: [], activeItem: '', activeSection: '' };
  }

  // Find all active/selected items
  const activeItems = navElement.querySelectorAll(
    '[aria-current="page"], [class*="active"], [class*="selected"]'
  );
  console.log(`🔍 [NAV DEBUG] Found ${activeItems.length} active/selected items`);

  const path = [];
  let activeItem = '';
  let activeSection = '';

  activeItems.forEach((item, index) => {
    const text = item.textContent.trim();
    console.log(`🔍 [NAV DEBUG] Active item ${index}: "${text}" (tag: ${item.tagName}, classes: ${item.className})`);
    if (text) {
      path.push(text);
      if (index === activeItems.length - 1) {
        activeItem = text; // Last item is the current page
        console.log(`🔍 [NAV DEBUG] Set activeItem: "${activeItem}"`);
      }
      if (index === activeItems.length - 2) {
        activeSection = text; // Second to last is the section
        console.log(`🔍 [NAV DEBUG] Set activeSection: "${activeSection}"`);
      }
    }
  });

  // If no active items found, try to build path from breadcrumbs
  if (path.length === 0) {
    console.log('🔍 [NAV DEBUG] No active items found, trying breadcrumbs...');
    const breadcrumb = document.querySelector('[role="navigation"][aria-label*="bread"]');
    if (breadcrumb) {
      console.log('🔍 [NAV DEBUG] Breadcrumb found');
      const links = breadcrumb.querySelectorAll('a, span');
      console.log(`🔍 [NAV DEBUG] Found ${links.length} breadcrumb links/spans`);
      links.forEach((link, index) => {
        const text = link.textContent.trim();
        console.log(`🔍 [NAV DEBUG] Breadcrumb ${index}: "${text}"`);
        if (text) path.push(text);
      });
    } else {
      console.log('🔍 [NAV DEBUG] ❌ No breadcrumb found');
    }
  }

  console.log(`🔍 [NAV DEBUG] Final navigation context:`, { path, activeItem, activeSection });
  return { path, activeItem, activeSection };
}

// Helper: Identify main content container
function identifyMainContent() {
  const mainSelectors = [
    '[class*="view-"]',             // PRIMARY - 100% success on all 7 pages tested
    '[class*="page"]',              // SECONDARY - also 100% success
    'main',                         // Semantic fallback
    '[role="main"]',                // ARIA fallback
    '[class*="main-content"]',      // Generic pattern fallback
    '[class*="content-area"]'       // Generic pattern fallback
  ];

  let matchedSelector = '';
  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      matchedSelector = selector;
      return element;
    }
  }

  // Fallback: Find largest content area excluding nav/header/footer
  const candidates = document.querySelectorAll('div[class], div[id]');
  let largest = null;
  let maxSize = 0;

  candidates.forEach(div => {
    // Skip if inside nav/header/footer
    if (div.closest('nav, header, footer, aside, [role="navigation"]')) {
      return;
    }

    const rect = div.getBoundingClientRect();
    const size = rect.width * rect.height;

    if (size > maxSize) {
      maxSize = size;
      largest = div;
    }
  });

  return largest || document.body;
}

// Helper: Extract tab context
function extractTabContext(container) {
  const tabList = container.querySelector('[role="tablist"], [class*="tabs"], [class*="tab-bar"]');

  if (!tabList) {
    return { active: [], available: [] };
  }

  const activeTabs = [];
  const availableTabs = [];

  const tabs = tabList.querySelectorAll('[role="tab"], [class*="tab"]');
  tabs.forEach(tab => {
    const text = tab.textContent.trim();
    if (!text) return;

    availableTabs.push(text);

    const isActive =
      tab.getAttribute('aria-selected') === 'true' ||
      tab.classList.contains('active') ||
      tab.classList.contains('selected');

    if (isActive) {
      activeTabs.push(text);
    }
  });

  return { active: activeTabs, available: availableTabs };
}

// Helper: Extract main content headings only
function extractMainContentHeadings(container) {
  if (!container) return [];

  const result = [];

  // Strategy 1: Try viewHeader first (works for 6/7 pages)
  const viewHeader = container.querySelector('[class*="viewHeader"]');
  if (viewHeader) {
    const headerHeadings = viewHeader.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headerHeadings.forEach(h => {
      const text = h.textContent.trim();
      if (text) {
        result.push({
          level: h.tagName.toLowerCase(),
          text: text
        });
      }
    });
  }

  // Strategy 2: Fallback - search main content but filter aggressively
  if (result.length === 0) {
    const allHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    allHeadings.forEach(heading => {
      // Filter out navigation drawer, app bar, and our chat extension
      if (heading.closest('[class*="navDrawer"], .MuiDrawer-root, header.MuiAppBar-root, #moveworks-chat-pane, #moveworks-pane-header')) {
        return;
      }

      const text = heading.textContent.trim();
      if (text) {
        result.push({
          level: heading.tagName.toLowerCase(),
          text: text
        });
      }
    });
  }

  return result;
}

// Helper: Extract sections with structure
function extractSections(container) {
  const sections = [];

  // Look for section headers (often h4, h5, or styled divs)
  const sectionHeaders = container.querySelectorAll(
    'h4, h5, h6, [class*="section-header"], [class*="section-title"]'
  );

  sectionHeaders.forEach(header => {
    const headerText = header.textContent.trim();
    if (!headerText) return;

    // Look for subsections or related content
    const subsections = [];
    let nextElement = header.nextElementSibling;

    // Collect next few headings or labeled content
    for (let i = 0; i < 5 && nextElement; i++) {
      if (nextElement.matches('h5, h6, [class*="subsection"]')) {
        subsections.push(nextElement.textContent.trim());
      }
      nextElement = nextElement.nextElementSibling;
    }

    sections.push({
      header: headerText,
      type: 'section',
      subsections: subsections
    });
  });

  return sections;
}

// Helper: Extract widgets/cards
function extractWidgets(container) {
  if (!container) return [];

  const widgets = [];

  // Detect MUI DataGrid (found on 3/7 pages - high priority)
  const dataGrids = container.querySelectorAll('.MuiDataGrid-root');
  dataGrids.forEach((grid, index) => {
    const columns = Array.from(grid.querySelectorAll('[role="columnheader"]'))
      .map(col => col.textContent.trim())
      .filter(col => col.length > 0);
    if (columns.length > 0) {
      widgets.push({
        type: 'datagrid',
        index: index,
        columns: columns
      });
    }
  });

  // Detect MUI Cards (found on 1/7 pages)
  const muiCards = container.querySelectorAll('[class*="MuiCard"]');
  if (muiCards.length > 0) {
    widgets.push({
      type: 'mui-cards',
      count: muiCards.length
    });
  }

  // Detect MUI Stepper (found on wizard pages)
  const stepper = container.querySelector('[class*="MuiStepper"]');
  if (stepper) {
    const steps = stepper.querySelectorAll('[class*="MuiStep"]');
    widgets.push({
      type: 'stepper',
      stepCount: steps.length
    });
  }

  // Look for generic stat cards (fallback)
  const cards = container.querySelectorAll('[class*="card"], [class*="widget"], [class*="stat"]');
  cards.forEach(card => {
    const title = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]');
    const value = card.querySelector('[class*="value"], [class*="count"], [class*="number"]');

    if (title || value) {
      widgets.push({
        type: 'card',
        title: title ? title.textContent.trim() : '',
        value: value ? value.textContent.trim() : ''
      });
    }
  });

  // Look for generic tables (fallback)
  const tables = container.querySelectorAll('table:not(.MuiDataGrid-root table), [role="table"]:not(.MuiDataGrid-root)');
  tables.forEach((table, index) => {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    if (headers.length > 0) {
      widgets.push({
        type: 'table',
        index: index,
        columns: headers
      });
    }
  });

  return widgets;
}

// Helper: Detect page type
function detectPageType(container) {
  if (container.querySelector('table, [role="table"]')) return 'table';
  if (container.querySelector('form')) return 'form';
  if (container.querySelectorAll('[class*="card"]').length >= 3) return 'dashboard';
  if (container.querySelector('[class*="wizard"], [class*="stepper"]')) return 'wizard';
  if (container.querySelector('[class*="list"], ul, ol')) return 'list';
  return 'content';
}

// Helper: Extract form context
function extractFormContext(container) {
  const fields = [];
  let description = '';

  // Find all labels within main content
  const labels = container.querySelectorAll('label');
  labels.forEach(label => {
    if (label.closest('nav, header, aside')) return;

    const text = label.textContent.trim();
    if (text) fields.push(text);
  });

  // Find input placeholders
  const inputs = container.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach(input => {
    if (input.closest('nav, header, aside')) return;

    if (input.placeholder && !input.placeholder.toLowerCase().includes('search')) {
      fields.push(input.placeholder);
    }
  });

  // Try to identify form purpose from nearby headings or descriptions
  const form = container.querySelector('form');
  if (form) {
    const nearbyHeading = form.previousElementSibling;
    if (nearbyHeading && nearbyHeading.matches('h1, h2, h3, h4')) {
      description = nearbyHeading.textContent.trim();
    }
  }

  return { fields, description };
}

// Helper: Extract main content text only
function extractMainContentText(container) {
  // Clone container to avoid modifying original
  const clone = container.cloneNode(true);

  // Remove excluded elements
  const excluded = clone.querySelectorAll('nav, header, footer, aside, [role="navigation"]');
  excluded.forEach(el => el.remove());

  // Get text content
  const text = clone.innerText || clone.textContent;
  return text.trim().substring(0, 1000);
}

// Extract page context
function extractPageContext() {
  // Check cache first
  const currentUrl = window.location.href;
  if (cachedPageContext && cachedContextUrl === currentUrl) {
    console.log('📦 Using cached page context');
    return cachedPageContext;
  }

  console.log('🔍 Extracting fresh page context...');
  const startTime = performance.now();

  const context = {
    url: currentUrl,
    title: document.title,
    timestamp: new Date().toISOString(),

    // Navigation context
    navigationPath: [],
    activeNavItem: '',
    navigationSectionActive: '',

    // Tab context
    activeTabs: [],
    availableTabs: [],

    // Main content structure
    mainContentHeadings: [],
    sections: [],

    // Form context
    formFields: [],
    formContext: '',

    // Page type and layout
    pageType: '',
    widgets: [],

    // Text content
    mainContentText: '',
    currentStep: '',

    // Legacy fields (for backward compatibility)
    headings: [],
    visibleText: ''
  };

  try {
    // 1. EXTRACT NAVIGATION HIERARCHY
    const navigationContext = extractNavigationContext();
    context.navigationPath = navigationContext.path;
    context.activeNavItem = navigationContext.activeItem;
    context.navigationSectionActive = navigationContext.activeSection;

    // 2. IDENTIFY MAIN CONTENT AREA
    const mainContent = identifyMainContent();

    if (!mainContent) {
      console.warn('Could not identify main content area, using document.body');
    }

    // 3. EXTRACT TAB CONTEXT (from main content)
    const tabContext = extractTabContext(mainContent);
    context.activeTabs = tabContext.active;
    context.availableTabs = tabContext.available;

    // 4. EXTRACT MAIN CONTENT HEADINGS ONLY
    context.mainContentHeadings = extractMainContentHeadings(mainContent);

    // 5. EXTRACT SECTIONS AND STRUCTURE
    context.sections = extractSections(mainContent);

    // 6. EXTRACT FORM FIELDS (main content only)
    const formContext = extractFormContext(mainContent);
    context.formFields = formContext.fields;
    context.formContext = formContext.description;

    // 7. DETECT PAGE TYPE
    context.pageType = detectPageType(mainContent);

    // 8. EXTRACT WIDGETS/CARDS
    context.widgets = extractWidgets(mainContent);

    // 9. EXTRACT MAIN CONTENT TEXT ONLY
    context.mainContentText = extractMainContentText(mainContent);

    // 10. EXTRACT CURRENT STEP (keep existing logic)
    let stepText = '';
    const stepIndicators = document.querySelectorAll('[class*="step"], [class*="progress"], [data-step]');
    stepIndicators.forEach(elem => {
      if (elem.textContent.trim() && elem.offsetParent !== null) {
        stepText += elem.textContent.trim() + ' ';
      }
    });
    context.currentStep = stepText.trim();

    // 11. POPULATE LEGACY FIELDS for backward compatibility
    context.headings = context.mainContentHeadings;
    context.visibleText = context.mainContentText;

  } catch (error) {
    console.error('Error extracting page context:', error);
  }

  // Debug: Log extracted context summary with details
  console.log('📄 Page Context Extracted:', {
    url: context.url,
    navigationPath: context.navigationPath,
    activeNavItem: context.activeNavItem,
    mainHeadings: context.mainContentHeadings.map(h => `${h.level.toUpperCase()}: "${h.text}"`),
    pageType: context.pageType,
    widgetCount: context.widgets.length,
    widgetTypes: context.widgets.map(w => w.type),
    activeTabs: context.activeTabs,
    hasText: context.mainContentText.length > 0,
    textPreview: context.mainContentText.substring(0, 100) + '...'
  });

  // Log performance
  const duration = performance.now() - startTime;
  console.log(`✅ Context extracted in ${duration.toFixed(2)}ms`);

  // Cache the context
  cachedPageContext = context;
  cachedContextUrl = currentUrl;

  return context;
}

// Message sending function
async function sendMessage() {
  const input = document.getElementById('moveworks-input');
  let messageText = input.value.trim();

  // If input is empty but element is selected, regenerate default question
  if (messageText === '' && selectedElementContext) {
    messageText = generateDefaultQuestion(selectedElementContext);
    console.log('🎯 Empty input with selected element, using default question:', messageText);
  }

  if (messageText === '') return;

  // Rate limiting check
  const now = Date.now();
  const timeSinceLastSend = now - lastSendTime;
  if (timeSinceLastSend < SEND_COOLDOWN) {
    const waitTime = Math.ceil((SEND_COOLDOWN - timeSinceLastSend) / 1000);
    addMessage(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.`, 'error');
    return;
  }

  // Update last send time
  lastSendTime = now;

  // Add user message to UI
  addMessage(messageText, 'user');

  // Clear input
  input.value = '';

  // Remove element chip after sending (one-time use)
  removeElementChip();

  // Disable send button, input field, and show loading state
  const sendBtn = document.getElementById('moveworks-send-btn');
  const originalBtnContent = sendBtn.innerHTML;
  sendBtn.disabled = true;
  sendBtn.classList.add('sending');
  sendBtn.textContent = '...';
  input.disabled = true;

  // Show loading indicator
  const loadingId = addLoadingMessage();

  // Extract page context
  const pageContext = extractPageContext();

  // Send message to background script for Claude API call
  try {
    // Check if chrome.runtime is available
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      throw new Error('Extension context invalidated. Please reload the page.');
    }

    const response = await chrome.runtime.sendMessage({
      type: 'SEND_TO_CLAUDE',
      message: messageText,
      context: pageContext
    });

    // Remove loading indicator
    removeLoadingMessage(loadingId);

    // Restore send button and input
    sendBtn.disabled = false;
    sendBtn.classList.remove('sending');
    sendBtn.innerHTML = originalBtnContent;
    input.disabled = false;

    if (response.success) {
      // Add assistant response to UI
      addMessage(response.message, 'assistant');
    } else {
      addMessage(`Error: ${response.error}`, 'error');
    }
  } catch (error) {
    removeLoadingMessage(loadingId);
    // Restore send button and input on error
    sendBtn.disabled = false;
    sendBtn.classList.remove('sending');
    sendBtn.innerHTML = originalBtnContent;
    input.disabled = false;
    console.error('Message send error:', error);
    addMessage(`Error: ${error.message}`, 'error');
  }
}

// Function to add loading indicator
function addLoadingMessage() {
  const messageArea = document.getElementById('moveworks-message-area');
  const loadingDiv = document.createElement('div');
  const loadingId = 'loading-' + Date.now();
  loadingDiv.id = loadingId;
  loadingDiv.className = 'message assistant-message loading-message';
  loadingDiv.innerHTML = `
    <div class="message-avatar">${moveworksIcon}</div>
    <div class="message-content-wrapper">
      <div class="message-sender">Moveworks Setup Assistant</div>
      <div class="message-content">
        <span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
      </div>
    </div>
  `;
  messageArea.appendChild(loadingDiv);
  messageArea.scrollTop = messageArea.scrollHeight;
  return loadingId;
}

// Function to remove loading indicator
function removeLoadingMessage(loadingId) {
  const loadingDiv = document.getElementById(loadingId);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Function to escape HTML attributes
function escapeHtmlAttribute(text) {
  return text.replace(/"/g, '&quot;')
             .replace(/'/g, '&#39;');
}

// Function to convert URLs to clickable links
function linkifyUrls(text) {
  // Match URLs (http, https)
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:!?'")\]])/g;
  return text.replace(urlRegex, (url) => {
    // Sanitize URL for href attribute
    const sanitizedUrl = escapeHtmlAttribute(url);
    return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
  });
}

// Function to parse markdown to HTML
function parseMarkdown(text) {
  let html = text;

  // Escape HTML tags first to prevent XSS
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');

  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Headers (## Heading)
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');

  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive list items in ul tags
  html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists (1. item)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Special handling for Sources section - extract and move to end
  let sourcesSection = '';
  const sourcesMatch = html.match(/Sources:\s*\n((?:\[\d+\][^\n]*\n?)+)/);
  if (sourcesMatch) {
    // Remove sources from original position
    html = html.replace(/Sources:\s*\n((?:\[\d+\][^\n]*\n?)+)/, '');

    // Build sources section
    const lines = sourcesMatch[0].split('\n').filter(line => line.trim());
    const sourcesLabel = lines[0];
    const sourceItems = lines.slice(1).map(line => {
      // Extract [N] and URL from line like "[1] https://..."
      const match = line.match(/^(\[\d+\])\s*(https?:\/\/[^\s]+)/);
      if (match) {
        const number = match[1]; // Already HTML escaped from initial escaping
        const url = match[2];
        // Sanitize URL for href attribute
        const sanitizedUrl = escapeHtmlAttribute(url);
        // Extract page title from URL (last segment after last /)
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        // Clean up the title (replace hyphens with spaces, capitalize)
        // Note: title doesn't need additional escaping as it's derived from URL structure
        const title = lastPart
          .replace(/\-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `<div class="source-item">${number} <a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="source-link">${title}</a></div>`;
      }
      return `<div class="source-item">${line}</div>`;
    }).join('');

    sourcesSection = `<div class="sources-section"><div class="sources-label">${sourcesLabel}</div>${sourceItems}</div>`;
  }

  // Line breaks (preserve double line breaks as paragraphs)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Convert remaining URLs to clickable links (not in sources)
  html = linkifyUrls(html);

  // Append sources section at the very end
  html = html + sourcesSection;

  return html;
}

// Function to add message to chat
function addMessage(text, sender) {
  const messageArea = document.getElementById('moveworks-message-area');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  // Create avatar
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  if (sender === 'user') {
    avatar.textContent = 'A';
  } else {
    avatar.innerHTML = moveworksIcon;
  }

  // Create message content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'message-content-wrapper';

  // Create sender name
  const senderName = document.createElement('div');
  senderName.className = 'message-sender';
  senderName.textContent = sender === 'user' ? 'Ankit Kant (You)' : 'Moveworks Setup Assistant';

  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  // Format assistant messages with markdown, keep user messages as plain text
  if (sender === 'assistant') {
    messageContent.innerHTML = parseMarkdown(text);
  } else {
    messageContent.textContent = text;
  }

  // Create timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  const now = new Date();
  timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Assemble message
  contentWrapper.appendChild(senderName);
  contentWrapper.appendChild(messageContent);
  contentWrapper.appendChild(timestamp);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentWrapper);
  messageArea.appendChild(messageDiv);

  // Scroll to bottom
  messageArea.scrollTop = messageArea.scrollHeight;
}

// Event listeners
toggleButton.addEventListener('click', openChat);

// Extension context recovery
let extensionContextValid = true;

function checkExtensionContext() {
  try {
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
      return false;
    }
    // Try to access chrome.runtime properties
    chrome.runtime.getManifest();
    return true;
  } catch (e) {
    return false;
  }
}

function showExtensionReloadBanner() {
  // Check if banner already exists
  if (document.getElementById('moveworks-reload-banner')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'moveworks-reload-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #FF9B8A;
    color: white;
    padding: 12px 20px;
    text-align: center;
    z-index: 10002;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `;
  banner.innerHTML = `
    <strong>Extension Updated:</strong> The Moveworks Setup Assistant extension has been updated.
    <button id="moveworks-reload-page-btn" style="
      margin-left: 12px;
      padding: 6px 16px;
      background: white;
      color: #FF9B8A;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">Reload Page</button>
  `;
  document.body.appendChild(banner);

  // Add reload button listener
  document.getElementById('moveworks-reload-page-btn').addEventListener('click', () => {
    window.location.reload();
  });
}

function startExtensionContextMonitoring() {
  // Check every 5 seconds if extension context is still valid
  const monitoringInterval = setInterval(() => {
    if (extensionContextValid && !checkExtensionContext()) {
      extensionContextValid = false;
      showExtensionReloadBanner();
      console.warn('⚠️ Extension context invalidated. User needs to reload page.');
      // Stop monitoring after detection to avoid repeated warnings
      clearInterval(monitoringInterval);
    }
  }, 5000);
}

// Function to generate contextual welcome message
function generateContextualWelcome(pageContext) {
  console.log('💬 [WELCOME DEBUG] Generating contextual welcome with context:', pageContext);

  if (!pageContext) {
    console.log('💬 [WELCOME DEBUG] ❌ No page context provided, using generic message');
    return 'Hi! I\'m here to help with your setup. How can I assist you?';
  }

  const pageName = pageContext.activeNavItem || pageContext.title || 'this page';
  console.log(`💬 [WELCOME DEBUG] pageName: "${pageName}" (activeNavItem: "${pageContext.activeNavItem}", title: "${pageContext.title}")`);

  const pageType = pageContext.pageType;
  const hasWidgets = pageContext.widgets && pageContext.widgets.length > 0;

  let message = `Hi! I'm here to help with **${pageName}**.`;

  // Add contextual suggestions based on page type
  if (pageType === 'form') {
    message += ` I can help you understand the form fields or guide you through filling them out.`;
  } else if (pageType === 'table' || hasWidgets && pageContext.widgets.some(w => w.type === 'datagrid')) {
    message += ` I can explain the columns, help you understand the data, or clarify settings.`;
  } else if (pageType === 'wizard' || pageContext.widgets.some(w => w.type === 'stepper')) {
    message += ` I can guide you through the steps or explain what information is needed at each stage.`;
  } else {
    message += ` Ask me anything about this page!`;
  }

  return message;
}

// Function to generate contextual placeholder
function generateContextualPlaceholder(pageContext) {
  if (!pageContext) {
    return 'Ask me anything about this page...';
  }

  const pageName = pageContext.activeNavItem || pageContext.title;
  const pageType = pageContext.pageType;
  const hasDataGrid = pageContext.widgets && pageContext.widgets.some(w => w.type === 'datagrid');

  // Generate contextual placeholder based on page characteristics
  if (pageType === 'form') {
    return 'Ask about required fields or how to fill this out...';
  } else if (pageType === 'table' || hasDataGrid) {
    return 'Ask about columns, filters, or settings...';
  } else if (pageType === 'wizard') {
    return 'Ask about this step or what information is needed...';
  } else if (pageName && pageName.toLowerCase().includes('api')) {
    return 'Ask about API testing, headers, or authentication...';
  } else if (pageName) {
    return `Ask about ${pageName}...`;
  } else {
    return 'Ask me anything about this page...';
  }
}

// Function to clear chat history
function clearChat() {
  const messageArea = document.getElementById('moveworks-message-area');
  const pageContext = extractPageContext();
  const welcomeMsg = generateContextualWelcome(pageContext);
  // Reset to contextual welcome message
  messageArea.innerHTML = `<div class="welcome-message">${parseMarkdown(welcomeMsg)}</div>`;
  // Update placeholder
  const input = document.getElementById('moveworks-input');
  if (input) {
    input.placeholder = generateContextualPlaceholder(pageContext);
  }
  console.log('💬 Chat cleared');
}

// Add elements to page when DOM is ready
async function initAssistant() {
  document.body.appendChild(toggleButton);
  document.body.appendChild(chatPane);

  // Wait for navigation to be available (MUI React takes time to render)
  await waitForNavigation();

  // Set initial contextual welcome message and placeholder
  const pageContext = extractPageContext();
  const welcomeMsg = generateContextualWelcome(pageContext);
  const messageArea = document.getElementById('moveworks-message-area');
  messageArea.innerHTML = `<div class="welcome-message">${parseMarkdown(welcomeMsg)}</div>`;

  const input = document.getElementById('moveworks-input');
  if (input) {
    input.placeholder = generateContextualPlaceholder(pageContext);
  }

  // Add cache invalidation on URL change
  window.addEventListener('popstate', () => {
    cachedPageContext = null;
    cachedContextUrl = null;
    console.log('🔄 Page navigation detected, context cache cleared');
  });

  // Attach header button listeners
  const clearBtn = document.getElementById('moveworks-clear-btn');
  clearBtn.addEventListener('click', clearChat);

  const inspectBtn = document.getElementById('moveworks-inspect-btn');
  inspectBtn.addEventListener('click', () => {
    if (pointAndAskEnabled) {
      activateInspectionMode();
    } else {
      console.warn('🎯 Point & Ask is disabled in settings');
    }
  });

  const closeBtn = document.getElementById('moveworks-close-btn');
  closeBtn.addEventListener('click', closeChat);

  const minimizeBtn = document.getElementById('moveworks-minimize-btn');
  minimizeBtn.addEventListener('click', minimizeChat);

  // Attach minimized state button listeners
  const maximizeBtn = document.getElementById('moveworks-maximize-btn');
  maximizeBtn.addEventListener('click', maximizeChat);

  const closeBtnMin = document.getElementById('moveworks-close-btn-min');
  closeBtnMin.addEventListener('click', closeChat);

  // Attach send button listener
  const sendBtn = document.getElementById('moveworks-send-btn');
  sendBtn.addEventListener('click', sendMessage);

  // Attach Enter key listener to input (reuse input variable from above)
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Load Point & Ask setting from storage
chrome.storage.local.get(['pointAndAskEnabled'], (result) => {
  pointAndAskEnabled = result.pointAndAskEnabled ?? true;
  console.log(`🎯 Point & Ask feature: ${pointAndAskEnabled ? 'enabled' : 'disabled'}`);
});

// Expose inspection functions for console testing (Phase 2 only)
window.activateInspectionMode = activateInspectionMode;
window.deactivateInspectionMode = deactivateInspectionMode;

// Listen for Point & Ask setting changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pointAndAskEnabled) {
    pointAndAskEnabled = changes.pointAndAskEnabled.newValue;
    console.log(`🎯 Point & Ask feature ${pointAndAskEnabled ? 'enabled' : 'disabled'}`);
    // Note: Button will be shown/hidden in Phase 3 when we add the button
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Moveworks Setup Assistant initialized (DOMContentLoaded)');
    initAssistant();
    startExtensionContextMonitoring();
  });
} else {
  console.log('✅ Moveworks Setup Assistant initialized (immediate)');
  initAssistant();
  startExtensionContextMonitoring();
}
