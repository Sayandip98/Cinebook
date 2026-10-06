import { baseApi } from '@/api/baseApi';
import { setCredentials, setUser } from '@/features/auth/authSlice';

const syncUser = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(setUser(data));
  } catch {
    /* the component shows the error */
  }
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      transformResponse: (response) => response.data.user,
      onQueryStarted: syncUser,
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({ url: '/users/me/avatar', method: 'PATCH', body: formData }),
      transformResponse: (response) => response.data.user,
      onQueryStarted: syncUser,
    }),
    removeAvatar: builder.mutation({
      query: () => ({ url: '/users/me/avatar', method: 'DELETE' }),
      transformResponse: (response) => response.data.user,
      onQueryStarted: syncUser,
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'PATCH', body }),
      transformResponse: (response) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* the component shows the error */
        }
      },
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useRemoveAvatarMutation,
  useChangePasswordMutation,
} = usersApi;
