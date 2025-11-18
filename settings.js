// Load existing API key and URLs when page loads
document.addEventListener('DOMContentLoaded', async () => {
  const storage = await chrome.storage.local.get(['claudeApiKey', 'setupPageUrls']);
  if (storage.claudeApiKey) {
    document.getElementById('api-key').value = storage.claudeApiKey;
  }

  // Load and display URLs
  if (storage.setupPageUrls && storage.setupPageUrls.length > 0) {
    renderUrlList(storage.setupPageUrls);
  } else {
    // Set default URL
    const defaultUrl = 'https://internal-configurator-web-server.kprod.prod.mw.int:48401/setup';
    await chrome.storage.local.set({ setupPageUrls: [defaultUrl] });
    renderUrlList([defaultUrl]);
  }

  // Attach toggle password visibility listener
  const toggleBtn = document.getElementById('toggle-password-btn');
  toggleBtn.addEventListener('click', togglePasswordVisibility);

  // Attach add URL button listener
  const addUrlBtn = document.getElementById('add-url-btn');
  addUrlBtn.addEventListener('click', addUrl);

  // Attach Enter key listener to new-url input
  const newUrlInput = document.getElementById('new-url');
  newUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  });
});

// Handle form submission
document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const apiKey = document.getElementById('api-key').value.trim();
  const statusDiv = document.getElementById('status');
  const saveBtn = document.querySelector('.save-btn');

  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  // Basic validation for Claude API key format
  if (!apiKey.startsWith('sk-ant-')) {
    showStatus('Invalid API key format. Claude API keys start with "sk-ant-"', 'error');
    return;
  }

  // Disable button while saving
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    // Save to Chrome storage
    await chrome.storage.local.set({ claudeApiKey: apiKey });
    showStatus('API key saved successfully!', 'success');
    saveBtn.textContent = 'Saved!';

    // Reset button after 2 seconds
    setTimeout(() => {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }, 2000);
  } catch (error) {
    showStatus(`Error saving API key: ${error.message}`, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
});

// Show status message
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      statusDiv.className = 'status-message';
    }, 5000);
  }
}

// Toggle password visibility
function togglePasswordVisibility() {
  const input = document.getElementById('api-key');
  const toggle = document.getElementById('toggle-password-btn');

  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = 'Hide API Key';
  } else {
    input.type = 'password';
    toggle.textContent = 'Show API Key';
  }
}

// Validate URL
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    // Must be https
    if (url.protocol !== 'https:') {
      return { valid: false, error: 'URL must use https:// protocol' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Render URL list
function renderUrlList(urls) {
  const urlListDiv = document.getElementById('url-list');
  urlListDiv.innerHTML = '';

  urls.forEach((url, index) => {
    const urlItem = document.createElement('div');
    urlItem.className = 'url-item';
    urlItem.innerHTML = `
      <span class="url-item-text">${url}</span>
      <button class="remove-url-btn" data-index="${index}" aria-label="Remove URL">×</button>
    `;
    urlListDiv.appendChild(urlItem);
  });

  // Attach remove button listeners
  document.querySelectorAll('.remove-url-btn').forEach(btn => {
    btn.addEventListener('click', removeUrl);
  });
}

// Add URL
async function addUrl() {
  const newUrlInput = document.getElementById('new-url');
  const urlString = newUrlInput.value.trim();

  if (!urlString) {
    showStatus('Please enter a URL', 'error');
    return;
  }

  // Validate URL
  const validation = isValidUrl(urlString);
  if (!validation.valid) {
    showStatus(validation.error, 'error');
    return;
  }

  // Get existing URLs
  const storage = await chrome.storage.local.get(['setupPageUrls']);
  const urls = storage.setupPageUrls || [];

  // Check for duplicates
  if (urls.includes(urlString)) {
    showStatus('This URL is already in the list', 'error');
    return;
  }

  // Add new URL
  urls.push(urlString);
  await chrome.storage.local.set({ setupPageUrls: urls });

  // Update display
  renderUrlList(urls);
  newUrlInput.value = '';
  showStatus('URL added successfully', 'success');
}

// Remove URL
async function removeUrl(e) {
  const index = parseInt(e.target.dataset.index);

  // Get existing URLs
  const storage = await chrome.storage.local.get(['setupPageUrls']);
  const urls = storage.setupPageUrls || [];

  // Remove URL at index
  urls.splice(index, 1);

  // Prevent removing all URLs
  if (urls.length === 0) {
    showStatus('You must have at least one URL configured', 'error');
    return;
  }

  // Save updated list
  await chrome.storage.local.set({ setupPageUrls: urls });

  // Update display
  renderUrlList(urls);
  showStatus('URL removed successfully', 'success');
}
