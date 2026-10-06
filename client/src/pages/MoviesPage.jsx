import { useSearchParams } from 'react-router-dom';
import { Clapperboard, X } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Skeleton from '@/components/common/Skeleton';
import MovieCard from '@/components/movie/MovieCard';
import { useGetMoviesQuery } from '@/features/movies/moviesApi';
import {
  MOVIE_GENRE_OPTIONS,
  MOVIE_LANGUAGE_OPTIONS,
  MOVIE_SORT_OPTIONS,
  MOVIE_STATUS_OPTIONS,
} from '@/constants/movieFilters';
import { cx } from '@/utils/classNames';
import page from './page.module.css';

const PAGE_SIZE = 15;
const DEFAULT_SORT = 'newest';

const pick = (value, options, fallback) =>
  options.some((option) => option.value === value) ? value : fallback;

export default function MoviesPage() {
  const [params, setParams] = useSearchParams();

  const filters = {
    search: params.get('search') ?? '',
    genre: params.get('genre') ?? '',
    language: params.get('language') ?? '',
    status: pick(params.get('status'), MOVIE_STATUS_OPTIONS, ''),
    sort: pick(params.get('sort'), MOVIE_SORT_OPTIONS, DEFAULT_SORT),
  };
  const currentPage = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const hasFilters = Boolean(
    filters.search || filters.genre || filters.language || filters.status || params.get('sort'),
  );

  const { data, isLoading, isFetching, isError } = useGetMoviesQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    search: filters.search || undefined,
    genre: filters.genre || undefined,
    language: filters.language || undefined,
    status: filters.status || undefined,
    sort: filters.sort,
  });

  const setParam = (key, value) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  const clearFilters = () => setParams({});

  let content;
  if (isLoading) {
    content = (
      <div className={page.grid}>
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} style={{ aspectRatio: '2 / 3.4' }} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={Clapperboard}
        title="Could not load movies"
        message="Please check that the API is running and try again."
      />
    );
  } else if (data.movies.length === 0) {
    content = (
      <EmptyState
        icon={Clapperboard}
        title="No movies match your filters"
        message="Try removing a filter or searching for a different word."
        action={hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : undefined}
      />
    );
  } else {
    content = (
      <>
        <div className={cx(page.grid, isFetching && page.busy)}>
          {data.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showRelease={movie.status === 'UPCOMING'} />
          ))}
        </div>
        <Pagination meta={data.meta} onPageChange={(value) => setParam('page', String(value))} />
      </>
    );
  }

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Movies</h1>
        <p className={page.subtitle}>
          {data
            ? `${data.meta.total} ${data.meta.total === 1 ? 'movie' : 'movies'}`
            : 'Find your next watch'}
        </p>
      </header>

      <div className={page.toolbar}>
        <SearchField
          value={filters.search}
          onSubmit={(value) => setParam('search', value)}
          placeholder="Search by title or keyword"
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={MOVIE_STATUS_OPTIONS}
          onChange={(value) => setParam('status', value)}
        />
        <FilterSelect
          label="Genre"
          value={filters.genre}
          options={MOVIE_GENRE_OPTIONS}
          onChange={(value) => setParam('genre', value)}
        />
        <FilterSelect
          label="Language"
          value={filters.language}
          options={MOVIE_LANGUAGE_OPTIONS}
          onChange={(value) => setParam('language', value)}
        />
        <FilterSelect
          label="Sort by"
          value={filters.sort}
          options={MOVIE_SORT_OPTIONS}
          onChange={(value) => setParam('sort', value === DEFAULT_SORT ? '' : value)}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      {content}
    </div>
  );
}
