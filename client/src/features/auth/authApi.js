import { baseApi } from '@/api/baseApi';
import { setSessionHint } from '@/utils/sessionHint';
import { loggedOut, selectAccessToken, setCredentials, setUser } from './authSlice';

const postBody = (url) => (body) => ({ url, method: 'POST', body });
const toMessage = (response) => response.message;

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: postBody('/auth/login'),
      transformResponse: (response) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          setSessionHint(true);
        } catch {
          /* the component shows the error */
        }
      },
    }),

    register: builder.mutation({
      query: postBody('/auth/register'),
      transformResponse: toMessage,
    }),

    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          /* log out locally even if the request fails */
        } finally {
          setSessionHint(false);
          dispatch(loggedOut());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => response.data,
    }),

    verifyEmail: builder.mutation({
      query: postBody('/auth/verify-email'),
      transformResponse: toMessage,
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
          // A signed-in user's cached profile still says isVerified: false.
          if (selectAccessToken(getState())) {
            const { data } = await dispatch(
              authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
            );
            if (data) dispatch(setUser(data.user));
          }
        } catch {
          /* the component shows the error */
        }
      },
    }),

    resendVerification: builder.mutation({
      query: postBody('/auth/resend-verification'),
      transformResponse: toMessage,
    }),

    forgotPassword: builder.mutation({
      query: postBody('/auth/forgot-password'),
      transformResponse: toMessage,
    }),

    resetPassword: builder.mutation({
      query: postBody('/auth/reset-password'),
      transformResponse: toMessage,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
