let refreshInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
let refreshTimer = null;

function startRefreshing() {
  // Refresh all tabs every 5 minutes
  refreshTimer = setInterval(() => {
    browser.tabs.query({}).then(tabs => {
      for (let tab of tabs) {
        browser.tabs.reload(tab.id);
      }
    });
  }, refreshInterval);
}

function stopRefreshing() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// Load the toggle state from storage and start or stop the refresh timer
browser.storage.local.get('isRefreshing').then(result => {
  if (result.isRefreshing) {
    startRefreshing();
  }
});

// Listen for changes to the toggle state and update the timer
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.isRefreshing) {
    if (changes.isRefreshing.newValue) {
      startRefreshing();
    } else {
      stopRefreshing();
    }
  }
});

