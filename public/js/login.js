/*eslint-disable*/

import axios from 'axios';
import { $ } from './dom';
import { showAlert } from './alert';

export function initLogin() {
  const form = $('[data-login-form]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await axios.post('/api/v1/user/login', { email, password });
      if (res.data.status === 'success') {
        showAlert('success', 'Logged In successfully!');
        setTimeout(() => {
          window.location.href = res.data.data.user.role === 'driver' ? '/driver' : '/dashboard';
        }, 2500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to log in. Please try again.';
      showAlert('error', message);
    }
  });
}
