/*eslint-disable*/

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (!el) return;
  el.classList.add('alert--hide');
  window.setTimeout(() => el.remove(), 200);
};

exports.showAlert = (type, msg) => {
  hideAlert();
  const el = document.createElement('div');
  el.className = `alert alert--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = msg;
  document.body.prepend(el);
  window.setTimeout(hideAlert, 4000);
};
