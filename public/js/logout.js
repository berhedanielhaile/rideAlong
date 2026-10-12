/*eslint-disable*/

import axios from 'axios';
import { $ } from './dom';
import { showAlert } from './alert';

export function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await axios.post('/api/v1/user/logout');
      if (res.data.status === 'success') {
        showAlert('success', 'loggedout successfully!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to log out. Please try again.';
      showAlert('error', message);
    }
  });
}
