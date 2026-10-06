import { baseApi } from '@/api/baseApi';

export const showsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShows: builder.query({
      query: (params) => ({ url: '/shows', params }),
      transformResponse: (response) => ({ shows: response.data.shows, meta: response.meta }),
      providesTags: ['Show'],
    }),
    getShow: builder.query({
      query: (id) => `/shows/${id}`,
      transformResponse: (response) => response.data.show,
      providesTags: ['Show'],
    }),
    getSeatMap: builder.query({
      query: (id) => `/shows/${id}/seats`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Seats', id }],
    }),
  }),
});

export const { useGetShowsQuery, useGetShowQuery, useGetSeatMapQuery } = showsApi;
