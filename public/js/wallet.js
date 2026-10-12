import axios from 'axios';
import { $, $$ } from './dom';
import { showAlert } from './alert';

export function initWallet() {
  const confirmBtn = $('[data-confirm-topup]');
  if (!confirmBtn) return;

  const customInput = $('[data-topup-custom]');
  const methodSelect = $('[data-topup-method]');
  const balanceEl = $('[data-wallet-balance]');
  let selectedAmount = 0;

  $$('[data-topup-amount]').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('[data-topup-amount]').forEach((item) => item.classList.toggle('active', item === chip));
      selectedAmount = Number(chip.dataset.topupAmount);
      if (customInput) customInput.value = String(selectedAmount);
    });
  });

  confirmBtn.addEventListener('click', async () => {
    const amount = Number(customInput?.value || selectedAmount);
    const method = methodSelect?.value || 'Wallet top-up';
    try {
      const { data } = await axios.post('/api/v1/user/me/wallet', { amount, method });
      if (data.status === 'success') {
        showAlert('success', 'Wallet topped up.');
        if (balanceEl) {
          balanceEl.textContent = `ETB ${Number(data.data.wallet_balance).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}`;
        }
        document.getElementById('topupDialog')?.classList.remove('open');
        window.setTimeout(() => window.location.reload(), 800);
      }
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Could not add funds.');
    }
  });
}
