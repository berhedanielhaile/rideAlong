/*eslint-disable*/

import { dashboard } from './driver-dashboard';

dashboard.startPolling();
(function () {
  driverRequest.startPolling();
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function ensureToastStack() {
    let stack = $('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showToast(message, type = '') {
    const stack = ensureToastStack();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`.trim();
    toast.textContent = message;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function setupNav() {
    const toggle = $('.nav-toggle');
    const panel = $('.nav-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function setupPasswordToggles() {
    $$('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.getAttribute('data-toggle-password'));
        if (!input) return;
        const hidden = input.type === 'password';
        input.type = hidden ? 'text' : 'password';
        btn.textContent = hidden ? 'Hide' : 'Show';
      });
    });
  }

  function setupRoleSwitch() {
    $$('.role-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.role-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const extra = $('#driverFields');
        const isDriver = btn.dataset.role === 'driver';
        if (extra) extra.classList.toggle('open', isDriver);
        $$('#driverFields input').forEach((input) => {
          input.required = isDriver;
        });
        document.body.dataset.role = btn.dataset.role;
      });
    });
  }

  function setupTabs() {
    $$('[data-tabs]').forEach((group) => {
      const buttons = $$('[data-tab]', group);
      const panels = $$('[data-panel]', group);
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.classList.remove('active'));
          panels.forEach((p) => p.classList.remove('active'));
          btn.classList.add('active');
          const panel = group.querySelector(`[data-panel="${btn.dataset.tab}"]`);
          if (panel) panel.classList.add('active');
        });
      });
    });
  }

  function setupSelectable(selector, activeClass) {
    $$(selector).forEach((item) => {
      item.addEventListener('click', () => {
        $$(selector).forEach((el) => el.classList.remove(activeClass));
        item.classList.add(activeClass);
      });
    });
  }

  function setupSearch() {
    $$('[data-search]').forEach((input) => {
      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        $$(input.dataset.search).forEach((row) => {
          row.hidden = query ? !row.textContent.toLowerCase().includes(query) : false;
        });
      });
    });
  }

  function setupDialogs() {
    $$('[data-open-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = document.getElementById(btn.dataset.openDialog);
        if (dialog) dialog.classList.add('open');
      });
    });

    $$('[data-close-dialog]').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.dialog-backdrop')?.classList.remove('open');
      });
    });
  }

  window.RideAlong = {
    toast: showToast,
    selectedRole() {
      return document.body.dataset.role || 'passenger';
    },
    swapLocations() {
      const a = $('#pickup');
      const b = $('#destination');
      if (!a || !b) return;
      const temp = a.value;
      a.value = b.value;
      b.value = temp;
    },
    confirmBooking() {
      showToast('Ride confirmed. Driver is on the way.', 'success');
      setTimeout(() => {
        window.location.href = 'tracking.html';
      }, 700);
    },
    handleLogin(event) {
      event.preventDefault();
      const role = RideAlong.selectedRole();
      showToast('Signed in successfully.', 'success');
      setTimeout(() => {
        window.location.href = role === 'driver' ? 'driver-dashboard.html' : 'dashboard.html';
      }, 600);
    },
    handleRegister(event) {
      event.preventDefault();
      const password = $('#password')?.value;
      const confirm = $('#passwordConfirm')?.value;
      if (password !== confirm) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      showToast('Account created. Sign in to continue.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
    },
    startRideFromHome(event) {
      event.preventDefault();
      window.location.href = 'register.html';
    },
    toggleOnline(btn) {
      btn.classList.toggle('active');
      const online = btn.classList.contains('active');
      const badge = $('[data-online-badge]');
      if (badge) {
        badge.textContent = online ? 'Online and available' : 'Offline';
        badge.classList.toggle('offline', !online);
      }
      showToast(online ? 'You are now online.' : 'You are now offline.', online ? 'success' : '');
    },
    copyCode(code) {
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      showToast(`${code} copied.`);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupPasswordToggles();
    setupRoleSwitch();
    setupTabs();
    setupSelectable('.ride-option', 'active');
    setupSelectable('.driver-pick', 'selected');
    setupSelectable('.chip', 'active');
    setupSelectable('.amount-grid .chip', 'active');
    setupSearch();
    setupDialogs();
  });
})();
