import { $$ } from './dom';

export function initDialogs() {
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

  $$('.dialog-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) backdrop.classList.remove('open');
    });
  });
}
