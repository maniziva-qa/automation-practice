/* =========================================================
   Automation Practice Lab — Shared JS Utilities
   ========================================================= */

// ─── Navigation ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
});

function highlightActiveNav() {
  const links = document.querySelectorAll('.sidebar-link[href]');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === current);
  });
}

// ─── Toast notifications ────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('data-testid', 'toast-notification');
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  return toast;
}
window.showToast = showToast;

// ─── Modal helpers ──────────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
window.openModal = openModal;
window.closeModal = closeModal;

// Click outside to close modals
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});

// ─── API helper ─────────────────────────────────────────────────────────────
async function apiCall(method, url, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json();
  return { status: res.status, ok: res.ok, data: json };
}
window.apiCall = apiCall;

// ─── Format JSON for display ────────────────────────────────────────────────
function prettyJSON(obj) {
  return JSON.stringify(obj, null, 2);
}
window.prettyJSON = prettyJSON;

// ─── Copy to clipboard ──────────────────────────────────────────────────────
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!', 'success'));
}
window.copyText = copyText;
