export type Theme = 'light' | 'dark';

export const THEME_KEY = 'glorious-mistakes:theme';

/**
 * Runs in <head> before the page paints, so there is no flash of the wrong theme.
 * Uses the visitor's saved choice, or their device setting until they make one
 * (and keeps following the device if it changes while the page is open).
 */
export const THEME_SCRIPT = `(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function saved() {
    try {
      var t = localStorage.getItem('${THEME_KEY}');
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) {
      return null;
    }
  }
  function apply() {
    root.setAttribute('data-theme', saved() || (media.matches ? 'dark' : 'light'));
  }
  apply();
  media.addEventListener('change', function () {
    if (!saved()) apply();
  });
})();`;

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}
