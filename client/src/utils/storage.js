export const STORAGE_KEYS = Object.freeze({
  THEME: 'cinebook:theme',
  CITY: 'cinebook:city',
  SESSION: 'cinebook:session',
});

export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable: ignore */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable: ignore */
    }
  },
};
