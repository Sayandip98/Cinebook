import { baseApi } from '@/api/baseApi';

const unwrap = (key) => (response) => response.data[key];
const withMeta = (key) => (response) => ({ [key]: response.data[key], meta: response.meta });
const json = (url, method, body) => ({ url, method, body });

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Stats and staff lists
    getStats: builder.query({
      query: () => '/manage/stats',
      transformResponse: (response) => response.data,
      providesTags: ['Stats'],
    }),
    getStaffBookings: builder.query({
      query: (params) => ({ url: '/manage/bookings', params }),
      transformResponse: withMeta('bookings'),
      providesTags: ['Booking'],
    }),
    getStaffShows: builder.query({
      query: (params) => ({ url: '/manage/shows', params }),
      transformResponse: withMeta('shows'),
      providesTags: ['Show'],
    }),
    checkIn: builder.mutation({
      query: (bookingCode) => json('/manage/check-in', 'POST', { bookingCode }),
      transformResponse: unwrap('booking'),
      invalidatesTags: ['Booking'],
    }),

    // Users (admin)
    getAdminUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      transformResponse: withMeta('users'),
      providesTags: ['User'],
    }),
    changeUserRole: builder.mutation({
      query: ({ id, role }) => json(`/admin/users/${id}/role`, 'PATCH', { role }),
      invalidatesTags: ['User'],
    }),
    changeUserStatus: builder.mutation({
      query: ({ id, isActive }) => json(`/admin/users/${id}/status`, 'PATCH', { isActive }),
      invalidatesTags: ['User', 'Stats'],
    }),

    // Refunds (admin)
    getRefunds: builder.query({
      query: (params) => ({ url: '/admin/refunds', params }),
      transformResponse: withMeta('payments'),
      providesTags: ['Refund'],
    }),
    retryRefund: builder.mutation({
      query: (id) => ({ url: `/admin/payments/${id}/refund`, method: 'POST' }),
      invalidatesTags: ['Refund', 'Stats', 'Booking'],
    }),

    // Movies (admin)
    createMovie: builder.mutation({
      query: (body) => json('/movies', 'POST', body),
      transformResponse: unwrap('movie'),
      invalidatesTags: ['Movie'],
    }),
    updateMovie: builder.mutation({
      query: ({ id, ...body }) => json(`/movies/${id}`, 'PATCH', body),
      transformResponse: unwrap('movie'),
      invalidatesTags: ['Movie'],
    }),
    deleteMovie: builder.mutation({
      query: (id) => ({ url: `/movies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Movie'],
    }),
    uploadPoster: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/movies/${id}/poster`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Movie'],
    }),

    // Theaters and screens
    getManageTheaters: builder.query({
      query: (params) => ({ url: '/theaters/manage', params }),
      transformResponse: withMeta('theaters'),
      providesTags: ['Theater'],
    }),
    createTheater: builder.mutation({
      query: (body) => json('/theaters', 'POST', body),
      invalidatesTags: ['Theater'],
    }),
    updateTheater: builder.mutation({
      query: ({ id, ...body }) => json(`/theaters/${id}`, 'PATCH', body),
      invalidatesTags: ['Theater', 'Show'],
    }),
    getScreens: builder.query({
      query: (theaterId) => `/theaters/${theaterId}/screens`,
      transformResponse: unwrap('screens'),
      providesTags: ['Screen'],
    }),
    createScreen: builder.mutation({
      query: ({ theaterId, ...body }) => json(`/theaters/${theaterId}/screens`, 'POST', body),
      invalidatesTags: ['Screen'],
    }),
    deactivateScreen: builder.mutation({
      query: (id) => ({ url: `/screens/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Screen'],
    }),

    // Shows
    createShow: builder.mutation({
      query: (body) => json('/shows', 'POST', body),
      invalidatesTags: ['Show', 'Seats', 'Stats'],
    }),
    updateShow: builder.mutation({
      query: ({ id, ...body }) => json(`/shows/${id}`, 'PATCH', body),
      invalidatesTags: ['Show', 'Seats'],
    }),
    cancelShow: builder.mutation({
      query: (id) => ({ url: `/shows/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Show', 'Seats', 'Stats'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetStaffBookingsQuery,
  useGetStaffShowsQuery,
  useCheckInMutation,
  useGetAdminUsersQuery,
  useChangeUserRoleMutation,
  useChangeUserStatusMutation,
  useGetRefundsQuery,
  useRetryRefundMutation,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useUploadPosterMutation,
  useGetManageTheatersQuery,
  useCreateTheaterMutation,
  useUpdateTheaterMutation,
  useGetScreensQuery,
  useCreateScreenMutation,
  useDeactivateScreenMutation,
  useCreateShowMutation,
  useUpdateShowMutation,
  useCancelShowMutation,
} = dashboardApi;
