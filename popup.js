document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleButton');

  // Get the current state from storage and update the button
  browser.storage.local.get('isRefreshing').then(result => {
    if (result.isRefreshing) {
      toggleButton.textContent = 'Stop Auto-Refresh';
    } else {
      toggleButton.textContent = 'Start Auto-Refresh';
    }
  });

  // Handle button clicks to toggle auto-refresh
  toggleButton.addEventListener('click', () => {
    browser.storage.local.get('isRefreshing').then(result => {
      const isRefreshing = result.isRefreshing || false;
      const newValue = !isRefreshing;

      browser.storage.local.set({ isRefreshing: newValue });

      if (newValue) {
        toggleButton.textContent = 'Stop Auto-Refresh';
      } else {
        toggleButton.textContent = 'Start Auto-Refresh';
      }
    });
  });
});

