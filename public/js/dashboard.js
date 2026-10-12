import { $$ } from './dom';
import { toast } from './toast';

export function initDashboard() {
  $$('[data-toast]').forEach((btn) => {
    btn.addEventListener('click', () => toast(btn.dataset.toast));
  });

  $$('[data-copy-code]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.copyCode;
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      toast(`${code} copied.`);
    });
  });
}
