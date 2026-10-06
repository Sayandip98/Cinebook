import { baseApi } from '@/api/baseApi';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (bookingId) => ({ url: '/payments/orders', method: 'POST', body: { bookingId } }),
      transformResponse: (response) => response.data.order,
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({ url: '/payments/verify', method: 'POST', body }),
      transformResponse: (response) => response.data.booking,
      invalidatesTags: ['Booking', 'Seats'],
    }),
  }),
});

export const { useCreateOrderMutation, useVerifyPaymentMutation } = paymentsApi;
