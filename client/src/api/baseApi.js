import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { loggedOut, setCredentials } from '@/features/auth/authSlice';
import { setSessionHint } from '@/utils/sessionHint';
import { refreshSession } from './refreshSession';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// On 401 while holding a token: refresh once, retry once, otherwise log out.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const hadToken = Boolean(api.getState().auth.accessToken);
  if (result.error?.status === 401 && hadToken) {
    const session = await refreshSession();
    if (session) {
      api.dispatch(setCredentials(session));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      setSessionHint(false);
      api.dispatch(loggedOut());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking', 'Seats'],
  endpoints: () => ({}),
});
