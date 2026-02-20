export function renderStyles(block) {
  return block.style ? block.style.join(" ") : "";
}

export function escapeHtml(text) {
  return String(text).replaceAll(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[ch]
  );
}