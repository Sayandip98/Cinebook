import { baseApi } from '@/api/baseApi';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: ({ movieId, ...params }) => ({ url: `/movies/${movieId}/reviews`, params }),
      transformResponse: (response) => ({ reviews: response.data.reviews, meta: response.meta }),
      providesTags: ['Review'],
    }),
    getMyReview: builder.query({
      query: (movieId) => `/movies/${movieId}/reviews/me`,
      transformResponse: (response) => response.data,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation({
      query: ({ movieId, ...body }) => ({
        url: `/movies/${movieId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Movie'],
    }),
    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Review', 'Movie'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Movie'],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetMyReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
