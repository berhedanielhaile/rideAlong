import { $$ } from './dom';

export function initTabs() {
  $$('[data-tabs]').forEach((group) => {
    if (group.classList.contains('auth-card')) return;

    const buttons = $$('[data-tab]', group);
    const panels = $$('[data-panel]', group);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.toggle('active', item === btn));
        panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === btn.dataset.tab));
      });
    });
  });
}
