import { $$ } from './dom';

const startForRange = (range) => {
  const now = new Date();
  if (range === 'week') {
    const date = new Date(now);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  }
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
};

export function initHistory() {
  const cards = $$('[data-ride-card], [data-earning-row]');
  const filters = $$('[data-range-filters] [data-range]');
  const search = document.querySelector('[data-search]');
  if (!cards.length) return;

  let range = document.querySelector('[data-range-filters] .chip.active')?.dataset.range || 'all';
  let query = '';

  function apply() {
    const start = startForRange(range);
    cards.forEach((card) => {
      const created = card.dataset.created ? new Date(card.dataset.created) : null;
      const inRange = !start || (created && created >= start);
      const haystack = (card.dataset.searchText || card.textContent || '').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      card.hidden = !(inRange && matchesQuery);
    });
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((item) => item.classList.toggle('active', item === btn));
      range = btn.dataset.range;
      apply();
    });
  });

  if (search) {
    search.addEventListener('input', () => {
      query = search.value.trim().toLowerCase();
      apply();
    });
  }

  apply();
}
