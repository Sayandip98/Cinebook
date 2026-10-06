import { useState } from 'react';
import toast from 'react-hot-toast';
import { Clapperboard, Plus, Star } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable from '@/components/common/DataTable';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Tag from '@/components/common/Tag';
import PosterImage from '@/components/movie/PosterImage';
import MovieFormModal from '@/features/dashboard/MovieFormModal';
import { useDeleteMovieMutation } from '@/features/dashboard/dashboardApi';
import { useGetMoviesQuery } from '@/features/movies/moviesApi';
import { useQueryState } from '@/hooks/useQueryState';
import { MOVIE_STATUS_OPTIONS } from '@/constants/movieFilters';
import { formatDate } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from '@/features/dashboard/dashboard.module.css';

const PAGE_SIZE = 10;
const STATUS_TONE = { NOW_SHOWING: 'success', UPCOMING: 'warning', ENDED: 'neutral' };
const STATUS_LABEL = { NOW_SHOWING: 'Now showing', UPCOMING: 'Coming soon', ENDED: 'Ended' };

export default function AdminMoviesPage() {
  const { params, setParam, page } = useQueryState();
  const search = params.get('search') ?? '';
  const status = MOVIE_STATUS_OPTIONS.some((o) => o.value === params.get('status'))
    ? params.get('status')
    : '';

  const [form, setForm] = useState({ open: false, movie: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleteMovie, { isLoading: isDeleting }] = useDeleteMovieMutation();

  const { data, isLoading, isFetching } = useGetMoviesQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    sort: 'newest',
  });

  const handleDelete = async () => {
    try {
      await deleteMovie(toDelete.id).unwrap();
      toast.success('Movie deleted');
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
    } finally {
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: 'movie',
      header: 'Movie',
      render: (movie) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className={styles.thumb}>
            <PosterImage movie={movie} />
          </div>
          <div className={styles.cell}>
            <span className={styles.cellMain}>{movie.title}</span>
            <span className={styles.muted}>{movie.genres.slice(0, 2).join(' · ')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (movie) => <Tag tone={STATUS_TONE[movie.status]}>{STATUS_LABEL[movie.status]}</Tag>,
    },
    { key: 'release', header: 'Release', render: (movie) => formatDate(movie.releaseDate) },
    {
      key: 'rating',
      header: 'Rating',
      render: (movie) =>
        movie.ratingCount > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} fill="currentColor" /> {movie.ratingAverage.toFixed(1)} (
            {movie.ratingCount})
          </span>
        ) : (
          <span className={styles.muted}>-</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (movie) => (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" onClick={() => setForm({ open: true, movie })}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setToDelete(movie)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Movies</h1>
          <p className={styles.sub}>
            Movies that have shows cannot be deleted. Set them to Ended instead.
          </p>
        </div>
        <Button onClick={() => setForm({ open: true, movie: null })}>
          <Plus size={16} /> Add movie
        </Button>
      </header>

      <div className={styles.toolbar}>
        <SearchField
          value={search}
          onSubmit={(v) => setParam('search', v)}
          placeholder="Search by title"
        />
        <FilterSelect
          label="Status"
          value={status}
          options={MOVIE_STATUS_OPTIONS}
          onChange={(v) => setParam('status', v)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.movies}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyIcon={Clapperboard}
        emptyTitle="No movies found"
      />
      <Pagination meta={data?.meta} onPageChange={(value) => setParam('page', String(value))} />

      <MovieFormModal
        open={form.open}
        movie={form.movie}
        onClose={() => setForm({ open: false, movie: null })}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this movie?"
        message={`"${toDelete?.title}" and its poster are removed permanently.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
