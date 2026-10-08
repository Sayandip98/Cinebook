import { baseApi } from '@/api/baseApi';

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableCoupons: builder.query({
      query: () => '/coupons/available',
      transformResponse: (response) => response.data.coupons,
      providesTags: ['Coupon'],
    }),
    validateCoupon: builder.query({
      query: ({ code, subtotal }) => ({ url: '/coupons/validate', params: { code, subtotal } }),
      transformResponse: (response) => response.data.coupon,
      keepUnusedDataFor: 0,
    }),
    getAdminCoupons: builder.query({
      query: (params) => ({ url: '/coupons/manage', params }),
      transformResponse: (response) => ({ coupons: response.data.coupons, meta: response.meta }),
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetAvailableCouponsQuery,
  useValidateCouponQuery,
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
} = couponsApi;
