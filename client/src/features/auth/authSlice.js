import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, isInitialized: false },
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.accessToken = payload.accessToken ?? state.accessToken;
      state.isInitialized = true;
    },
    setUser(state, { payload }) {
      state.user = payload;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    loggedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, setUser, setInitialized, loggedOut } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthReady = (state) => state.auth.isInitialized;

export default authSlice.reducer;
