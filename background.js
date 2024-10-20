let refreshTimer = null;
let excludedTabs = new Set();

// Start the refresh process
browser.storage.local.get(['isRefreshing', 'refreshInterval', 'excludedTabs']).then(result => {
  const refreshInterval = result.refreshInterval || 5 * 60000; // Default to 5 minutes
  excludedTabs = new Set(result.excludedTabs || []);
  if (result.isRefreshing) {
    startRefreshing(refreshInterval);
  }
});

// Function to start refreshing tabs, excluding marked ones
function startRefreshing(interval) {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(() => {
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        if (!excludedTabs.has(tab.id)) {
          browser.tabs.reload(tab.id);
        }
      });
    });
  }, interval);
}

// Function to stop refreshing
function stopRefreshing() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// Message listener for tab ID requests
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === 'getTabId') {
    sendResponse({ tabId: sender.tab.id });
  }
});

// Listen for changes in storage (e.g., timer or excluded tabs)
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.isRefreshing) {
      if (changes.isRefreshing.newValue) {
        browser.storage.local.get('refreshInterval').then(result => {
          startRefreshing(result.refreshInterval || 5 * 60000);
        });
      } else {
        stopRefreshing();
      }
    }

    if (changes.excludedTabs) {
      excludedTabs = new Set(changes.excludedTabs.newValue);
    }
  }
});

