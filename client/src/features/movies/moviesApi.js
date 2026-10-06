import { baseApi } from '@/api/baseApi';

export const moviesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMovies: builder.query({
      query: (params) => ({ url: '/movies', params }),
      transformResponse: (response) => ({ movies: response.data.movies, meta: response.meta }),
      providesTags: ['Movie'],
    }),
    getMovie: builder.query({
      query: (slug) => `/movies/${slug}`,
      transformResponse: (response) => response.data.movie,
      providesTags: ['Movie'],
    }),
  }),
});

export const { useGetMoviesQuery, useGetMovieQuery } = moviesApi;
