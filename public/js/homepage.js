import { $ } from './dom';

export function initHomepage() {
  const form = $('[data-home-search]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = form.dataset.next || '/register';
  });
}
