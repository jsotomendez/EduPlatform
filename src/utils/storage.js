const PREFIX = 'edu_';

export const storage = {
  /** @param {string} key @param {any} value */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (_) {}
  },

  /** @param {string} key @param {any} [defaultValue] @returns {any} */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  },

  /** @param {string} key */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
