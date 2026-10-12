import axios from 'axios';
import { $, $$ } from './dom';
import { showAlert } from './alert';

export function initProfile() {
  const form = $('[data-profile-form]');
  const editBtn = $('[data-edit-profile]');
  if (editBtn && form) {
    editBtn.addEventListener('click', () => {
      $$('input', form).forEach((input) => {
        input.disabled = false;
      });
      showAlert('info', 'You can now edit your details.');
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      try {
        await axios.patch('/api/v1/user/me', payload);
        showAlert('success', 'Profile saved.');
        $$('input', form).forEach((input) => {
          input.disabled = true;
        });
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not save profile.');
      }
    });
  }

  $$('[data-set-payment]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.patch('/api/v1/user/me/payment', { method: btn.dataset.setPayment });
        showAlert('success', 'Default payment updated.');
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not update payment method.');
      }
    });
  });

  $$('[data-remove-place]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await axios.delete(`/api/v1/user/me/places/${encodeURIComponent(btn.dataset.removePlace)}`);
        showAlert('success', 'Place removed.');
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not remove place.');
      }
    });
  });

  const placeForm = $('[data-add-place]');
  if (placeForm) {
    placeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(placeForm).entries());
      try {
        await axios.post('/api/v1/user/me/places', payload);
        showAlert('success', 'Place saved.');
        window.location.reload();
      } catch (error) {
        showAlert('error', error.response?.data?.message || 'Could not save place.');
      }
    });
  }
}
