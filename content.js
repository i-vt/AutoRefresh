// Check if the container already exists to avoid duplicates
if (!document.getElementById('refreshContainer')) {

  // Create a container to wrap both checkbox and label for easier visibility control
  const container = document.createElement('div');
  container.id = 'refreshContainer';
  container.style.position = 'fixed'; // Position the container as fixed
  container.style.bottom = '10px';
  container.style.right = '10px';
  container.style.zIndex = '9999';
  container.style.display = 'flex'; // Flex layout to align checkbox and label
  container.style.alignItems = 'center';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent background
  container.style.padding = '5px';
  container.style.borderRadius = '5px';
  container.style.color = 'white';
  container.style.cursor = 'move'; // Show move cursor for the whole container
  container.style.userSelect = 'none'; // Prevent text selection while dragging
  container.style.visibility = 'hidden'; // Initially hidden, only show when timer is running

  // Create the checkbox element
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'refreshToggle';
  checkbox.title = 'Exclude from Auto-Refresh';
  checkbox.style.marginRight = '10px'; // Space between checkbox and label
  checkbox.style.cursor = 'pointer';

  // Add a label for the checkbox, but prevent it from toggling the checkbox
  const label = document.createElement('label');
  label.textContent = 'Exclude from Auto-Refresh';
  label.style.userSelect = 'none'; // Prevent text selection while dragging

  // Prevent the label from toggling the checkbox
  label.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the label from checking/unchecking the checkbox
  });

  // Append the checkbox and label to the container
  container.appendChild(checkbox);
  container.appendChild(label);

  // Append the container to the body
  document.body.appendChild(container);

  // Load the initial state and position from storage
  browser.runtime.sendMessage({ message: 'getTabId' }, response => {
    const tabId = response.tabId;

    // Get saved position and state from storage
    browser.storage.local.get(['excludedTabs', `position_${tabId}`, 'isRefreshing']).then(result => {
      const excludedTabs = result.excludedTabs || [];
      checkbox.checked = excludedTabs.includes(tabId);

      // Set saved position if available
      const position = result[`position_${tabId}`];
      if (position) {
        container.style.top = position.top;
        container.style.left = position.left;
        container.style.bottom = '';
        container.style.right = '';
      }

      // Show the checkbox and label only if the timer is running
      if (result.isRefreshing) {
        container.style.visibility = 'visible';
      } else {
        container.style.visibility = 'hidden';
      }
    });

    // Handle checkbox change event
    checkbox.addEventListener('change', () => {
      browser.storage.local.get('excludedTabs').then(result => {
        let excludedTabs = result.excludedTabs || [];

        if (checkbox.checked) {
          if (!excludedTabs.includes(tabId)) {
            excludedTabs.push(tabId);
          }
        } else {
          excludedTabs = excludedTabs.filter(id => id !== tabId);
        }

        // Save the updated list of excluded tabs
        browser.storage.local.set({ excludedTabs });
      });
    });

    // Make the container draggable with boundary constraints
    function makeElementDraggable(element) {
      let posX = 0, posY = 0, initialX = 0, initialY = 0;

      function onMouseDown(e) {
        e.preventDefault();
        initialX = e.clientX;
        initialY = e.clientY;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function onMouseMove(e) {
        posX = initialX - e.clientX;
        posY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;

        // Calculate new position
        let top = element.offsetTop - posY;
        let left = element.offsetLeft - posX;

        // Apply boundary constraints (keep the element within the window)
        const containerWidth = element.offsetWidth;
        const containerHeight = element.offsetHeight;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (top < 0) top = 0; // Prevent moving out from the top
        if (left < 0) left = 0; // Prevent moving out from the left
        if (top + containerHeight > windowHeight) top = windowHeight - containerHeight; // Prevent moving out from the bottom
        if (left + containerWidth > windowWidth) left = windowWidth - containerWidth; // Prevent moving out from the right

        // Apply the new position
        element.style.top = top + 'px';
        element.style.left = left + 'px';
        element.style.bottom = '';
        element.style.right = '';
      }

      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Save the final position in storage
        browser.storage.local.set({
          [`position_${tabId}`]: {
            top: element.style.top,
            left: element.style.left
          }
        });
      }

      element.addEventListener('mousedown', onMouseDown);
    }

    // Make the container draggable
    makeElementDraggable(container);
  });

  // Listen for changes to the timer status
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.isRefreshing) {
      if (changes.isRefreshing.newValue) {
        container.style.visibility = 'visible'; // Show when timer is running
      } else {
        container.style.visibility = 'hidden';  // Hide when timer is stopped
      }
    }
  });
}

