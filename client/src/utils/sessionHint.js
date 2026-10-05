import { STORAGE_KEYS, storage } from './storage';

export const hasSessionHint = () => storage.get(STORAGE_KEYS.SESSION) === '1';

export const setSessionHint = (active) => {
  if (active) storage.set(STORAGE_KEYS.SESSION, '1');
  else storage.remove(STORAGE_KEYS.SESSION);
};
