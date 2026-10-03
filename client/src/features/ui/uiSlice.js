import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = uiSlice.actions;
export const selectTheme = (state) => state.ui.theme;
export default uiSlice.reducer;
