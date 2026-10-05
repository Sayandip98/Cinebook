import { useGetMoviesQuery } from '@/features/movies/moviesApi';
import HeroCarousel from '@/features/home/HeroCarousel';
import MovieSection from '@/features/home/MovieSection';
import GenreGrid from '@/features/home/GenreGrid';
import TheaterSpotlight from '@/features/home/TheaterSpotlight';
import { ROUTES } from '@/constants/routes';

const HERO_SLIDES = 5;

export default function HomePage() {
  const nowShowing = useGetMoviesQuery({ status: 'NOW_SHOWING', limit: 10, sort: 'newest' });
  const upcoming = useGetMoviesQuery({ status: 'UPCOMING', limit: 10, sort: 'oldest' });

  const nowShowingMovies = nowShowing.data?.movies ?? [];

  return (
    <>
      <HeroCarousel
        movies={nowShowingMovies.slice(0, HERO_SLIDES)}
        isLoading={nowShowing.isLoading}
      />
      <MovieSection
        eyebrow="In theaters now"
        title="Now showing"
        movies={nowShowingMovies}
        isLoading={nowShowing.isLoading}
        isError={nowShowing.isError}
        actionTo={`${ROUTES.MOVIES}?status=NOW_SHOWING`}
      />
      <MovieSection
        eyebrow="Future premieres"
        title="Coming soon"
        movies={upcoming.data?.movies ?? []}
        isLoading={upcoming.isLoading}
        isError={upcoming.isError}
        actionTo={`${ROUTES.MOVIES}?status=UPCOMING`}
        showRelease
      />
      <GenreGrid />
      <TheaterSpotlight />
    </>
  );
}
