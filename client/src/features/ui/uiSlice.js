import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS, storage } from '@/utils/storage';

const getInitialTheme = () => {
  const stored = storage.get(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    city: storage.get(STORAGE_KEYS.CITY) ?? '',
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setCity(state, { payload }) {
      state.city = payload;
    },
  },
});

export const { toggleTheme, setCity } = uiSlice.actions;
export const selectTheme = (state) => state.ui.theme;
export const selectCity = (state) => state.ui.city;
export default uiSlice.reducer;
