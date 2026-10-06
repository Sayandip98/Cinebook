import { baseApi } from '@/api/baseApi';

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      transformResponse: (response) => response.data.booking,
      invalidatesTags: ['Seats', 'Booking'],
    }),
    getMyBookings: builder.query({
      query: (params) => ({ url: '/bookings/my', params }),
      transformResponse: (response) => ({ bookings: response.data.bookings, meta: response.meta }),
      providesTags: ['Booking'],
    }),
    getBooking: builder.query({
      query: (id) => `/bookings/${id}`,
      transformResponse: (response) => response.data.booking,
      providesTags: ['Booking'],
    }),
    getTicket: builder.query({
      query: (id) => `/bookings/${id}/ticket`,
      transformResponse: (response) => response.data,
      providesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/cancel`, method: 'POST' }),
      transformResponse: (response) => ({
        booking: response.data.booking,
        message: response.message,
      }),
      invalidatesTags: ['Booking', 'Seats'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingQuery,
  useGetTicketQuery,
  useCancelBookingMutation,
} = bookingsApi;
