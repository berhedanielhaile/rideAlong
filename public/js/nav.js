import { $ } from './dom';

export function initNav() {
  const toggle = $('.nav-toggle');
  const panel = $('.nav-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}
