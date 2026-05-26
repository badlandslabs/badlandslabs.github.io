/**
 * Badlands Labs - Main Application
 * Handles tab navigation, deep-linking, code copying, and chart initialization
 */

(function() {
  'use strict';

  // ========================================
  // Tab Navigation & Deep Linking
  // ========================================

  /**
   * Initialize tab navigation system
   * Sets up click handlers and manages active states
   */
  function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const headerNavLinks = document.querySelectorAll('.header-nav a');

    // Handle tab button clicks
    tabButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        const tabId = this.getAttribute('data-tab');
        activateTab(tabId);
        updateURLHash(tabId);
      });
    });

    // Handle header nav clicks
    headerNavLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const tabId = href.substring(1);
          activateTab(tabId);
          updateURLHash(tabId);
        }
      });
    });
  }

  /**
   * Activate a specific tab by ID
   * @param {string} tabId - The ID of the tab to activate
   */
  function activateTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const headerNavLinks = document.querySelectorAll('.header-nav a');

    // Deactivate all tabs
    tabButtons.forEach(function(btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    tabPanels.forEach(function(panel) {
      panel.classList.remove('active');
    });

    headerNavLinks.forEach(function(link) {
      link.classList.remove('active');
    });

    // Activate selected tab
    const selectedButton = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    const selectedPanel = document.getElementById(tabId);
    const selectedHeaderLink = document.querySelector('.header-nav a[href="#' + tabId + '"]');

    if (selectedButton) {
      selectedButton.classList.add('active');
      selectedButton.setAttribute('aria-selected', 'true');
    }

    if (selectedPanel) {
      selectedPanel.classList.add('active');
    }

    if (selectedHeaderLink) {
      selectedHeaderLink.classList.add('active');
    }

    // Reinitialize charts if status tab is activated
    if (tabId === 'status') {
      setTimeout(initStatusCharts, 100);
    }
  }

  /**
   * Update URL hash without scrolling
   * @param {string} tabId - The tab ID to set in the URL
   */
  function updateURLHash(tabId) {
    const newHash = '#' + tabId;
    if (history.pushState) {
      history.pushState(null, '', newHash);
    } else {
      location.hash = newHash;
    }
  }

  /**
   * Handle initial URL hash and browser navigation
   */
  function handleHashChange() {
    const hash = location.hash.substring(1);
    if (hash) {
      const validTabs = ['docs', 'status', 'support', 'privacy', 'terms'];
      if (validTabs.indexOf(hash) !== -1) {
        activateTab(hash);
      }
    }
  }

  // ========================================
  // Copy to Clipboard
  // ========================================

  /**
   * Copy code from a code block to the clipboard
   * @param {HTMLElement} button - The copy button element
   */
  function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeContent = codeBlock.querySelector('.code-content pre');

    if (!codeContent) {
      return;
    }

    const code = codeContent.textContent;

    navigator.clipboard.writeText(code).then(function() {
      const span = button.querySelector('span');
      const originalText = span.textContent;

      button.classList.add('copied');
      span.textContent = 'Copied!';

      setTimeout(function() {
        button.classList.remove('copied');
        span.textContent = originalText;
      }, 2000);
    }).catch(function(err) {
      console.error('Failed to copy: ', err);
    });
  }

  /**
   * Attach copy handlers to all copy buttons
   */
  function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        copyCode(this);
      });
    });
  }

  /**
   * Make copyCode available globally for onclick handlers
   */
  window.copyCode = copyCode;

  // ========================================
  // Status Charts (Mock Data)
  // ========================================

  /**
   * Generate mock uptime data for past 90 days
   * @returns {Array} Array of daily status objects
   */
  function generateMockUptimeData() {
    const data = [];
    const now = new Date();

    for (var i = 89; i >= 0; i--) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic uptime data with occasional issues
      var rand = Math.random();
      var status;
      var height;

      if (rand > 0.995) {
        // Occasional outage (0.5% chance)
        status = 'outage';
        height = 20 + Math.random() * 15;
      } else if (rand > 0.97) {
        // Occasional degraded (3% chance)
        status = 'degraded';
        height = 40 + Math.random() * 20;
      } else {
        // Normal operational
        status = 'operational';
        height = 60 + Math.random() * 40;
      }

      data.push({
        date: date,
        status: status,
        height: height
      });
    }

    return data;
  }

  /**
   * Render the 90-day uptime bar chart
   */
  function renderUptimeChart() {
    const container = document.getElementById('uptime-bars');
    if (!container) {
      return;
    }

    container.innerHTML = '';
    var data = generateMockUptimeData();

    data.forEach(function(day, index) {
      var bar = document.createElement('div');
      bar.className = 'bar ' + day.status;
      bar.style.height = day.height + 'px';
      bar.setAttribute('title', formatDate(day.date) + ' - ' + day.status);
      bar.setAttribute('data-status', day.status);

      // Add hover effect
      bar.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
      });

      bar.addEventListener('mouseleave', function() {
        this.style.opacity = '';
      });

      container.appendChild(bar);
    });
  }

  /**
   * Format date for display
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string
   */
  function formatDate(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  /**
   * Initialize status charts with animation
   */
  function initStatusCharts() {
    renderUptimeChart();
    updateLatencyValues();
  }

  /**
   * Update latency display values with slight randomization
   * Creates realistic feeling mock data
   */
  function updateLatencyValues() {
    var p50 = document.getElementById('latency-p50');
    var p95 = document.getElementById('latency-p95');
    var p99 = document.getElementById('latency-p99');
    var avg = document.getElementById('latency-avg');

    var baseP50 = 42;
    var baseP95 = 118;
    var baseP99 = 187;
    var baseAvg = 67;

    if (p50) p50.textContent = baseP50 + Math.floor(Math.random() * 5) + 'ms';
    if (p95) p95.textContent = baseP95 + Math.floor(Math.random() * 10) + 'ms';
    if (p99) p99.textContent = baseP99 + Math.floor(Math.random() * 15) + 'ms';
    if (avg) avg.textContent = baseAvg + Math.floor(Math.random() * 8) + 'ms';
  }

  // ========================================
  // Form Handling
  // ========================================

  /**
   * Handle support form submission
   * @param {Event} event - The form submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    var form = event.target;
    var formSuccess = document.getElementById('form-success');

    // Basic validation
    var name = form.querySelector('[name="name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var subject = form.querySelector('[name="subject"]').value.trim();
    var message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !subject || !message) {
      return;
    }

    // Simulate form submission
    form.style.display = 'none';
    formSuccess.style.display = 'block';

    // In a real implementation, this would send to a backend
    console.log('Support form submitted:', { name: name, email: email, subject: subject, message: message });
  }

  /**
   * Initialize form handlers
   */
  function initForms() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      form.addEventListener('submit', handleFormSubmit);
    });
  }

  // ========================================
  // Navigation Helper
  // ========================================

  /**
   * Navigate to a specific tab programmatically
   * @param {string} tabId - The tab ID to navigate to
   */
  window.navigateToTab = function(tabId) {
    activateTab(tabId);
    updateURLHash(tabId);

    // Scroll to top of tab section
    var tabSection = document.querySelector('.tab-section');
    if (tabSection) {
      tabSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ========================================
  // Initialization
  // ========================================

  /**
   * Initialize all application functionality
   */
  function init() {
    initTabNavigation();
    initCopyButtons();
    initForms();

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initialize status charts if on status tab
    if (location.hash.substring(1) === 'status') {
      setTimeout(initStatusCharts, 100);
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
