import { $, $$ } from './dom';

export function initAuthTabs() {
  const authTabs = $('.auth-card[data-tabs]');
  if (!authTabs) return;

  const tabButtons = $$('[data-tab]', authTabs);
  const tabPanels = $$('[data-panel]', authTabs);

  const showAuthTab = (name) => {
    tabButtons.forEach((button) => {
      const on = button.dataset.tab === name;
      button.classList.toggle('active', on);
      button.setAttribute('aria-selected', String(on));
    });
    tabPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === name));
    history.replaceState(null, '', name === 'register' ? '/signup' : '/login');
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => showAuthTab(button.dataset.tab));
  });
}
