/**
 * Returns a stable anonymous browser ID stored in localStorage.
 * Used to track fan votes and predictions without requiring sign-up.
 */
export function getBrowserId() {
  let id = localStorage.getItem('dwogpacu_browser_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('dwogpacu_browser_id', id);
  }
  return id;
}
