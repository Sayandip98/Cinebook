import { baseApi } from '@/api/baseApi';

export const theatersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTheaters: builder.query({
      query: (params) => ({ url: '/theaters', params }),
      transformResponse: (response) => ({
        theaters: response.data.theaters,
        meta: response.meta,
      }),
      providesTags: ['Theater'],
    }),
    getCities: builder.query({
      query: () => '/theaters/cities',
      transformResponse: (response) => response.data.cities,
      providesTags: ['Theater'],
    }),
    getTheater: builder.query({
      query: (id) => `/theaters/${id}`,
      transformResponse: (response) => response.data.theater,
      providesTags: ['Theater'],
    }),
  }),
});

export const { useGetTheatersQuery, useGetCitiesQuery, useGetTheaterQuery } = theatersApi;
