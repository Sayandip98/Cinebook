import { baseApi } from '@/api/baseApi';

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetHealthQuery } = systemApi;
