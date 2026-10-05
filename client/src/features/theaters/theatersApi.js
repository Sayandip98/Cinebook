import { baseApi } from '@/api/baseApi';

export const theatersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTheaters: builder.query({
      query: (params) => ({ url: '/theaters', params }),
      transformResponse: (response) => ({
        theaters: response.data.theaters,
        meta: response.meta,
      }),
    }),
    getCities: builder.query({
      query: () => '/theaters/cities',
      transformResponse: (response) => response.data.cities,
    }),
  }),
});

export const { useGetTheatersQuery, useGetCitiesQuery } = theatersApi;
