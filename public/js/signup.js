import { $ } from './dom';
import { showAlert } from './alert';
import axios from 'axios';

export function initSignup() {
  const form = $('[data-signup-form]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/user/signup', {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        password: document.getElementById('password').value,
        passwordConfirm: document.getElementById('passwordConfirm').value,
      });
      if (res.data.status === 'success') {
        showAlert('success', 'Account created successfully.');
        window.setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to create your account. Please try again.';
      showAlert('error', message);
    }
  });
}
