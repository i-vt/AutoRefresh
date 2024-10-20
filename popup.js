document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleButton');
  const timerDurationInput = document.getElementById('timerDuration');

  // Load the current state from storage
  browser.storage.local.get(['isRefreshing', 'refreshInterval']).then(result => {
    if (result.isRefreshing) {
      toggleButton.textContent = 'Stop Auto-Refresh';
      timerDurationInput.disabled = true;  // Disable input if timer is running
    } else {
      toggleButton.textContent = 'Start Auto-Refresh';
      timerDurationInput.disabled = false; // Enable input if timer is stopped
    }

    // Load stored refresh interval (in minutes) if available
    if (result.refreshInterval) {
      timerDurationInput.value = result.refreshInterval / 60000; // Convert from milliseconds to minutes
    }
  });

  // Handle button clicks to toggle auto-refresh
  toggleButton.addEventListener('click', () => {
    browser.storage.local.get('isRefreshing').then(result => {
      const isRefreshing = result.isRefreshing || false;
      const newValue = !isRefreshing;

      // Save the new toggle state
      browser.storage.local.set({ isRefreshing: newValue });

      if (newValue) {
        toggleButton.textContent = 'Stop Auto-Refresh';
        timerDurationInput.disabled = true;  // Disable input when timer starts
      } else {
        toggleButton.textContent = 'Start Auto-Refresh';
        timerDurationInput.disabled = false; // Enable input when timer stops
      }
    });
  });

  // Handle changes to the timer duration
  timerDurationInput.addEventListener('input', () => {
    const minutes = parseInt(timerDurationInput.value);
    const interval = minutes * 60000; // Convert minutes to milliseconds

    // Store the new refresh interval
    browser.storage.local.set({ refreshInterval: interval });
  });
});

