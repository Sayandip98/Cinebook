import { Link, useParams } from 'react-router-dom';
import { Clapperboard, Clock, Play, Star } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import SectionHeader from '@/components/common/SectionHeader';
import PosterImage from '@/components/movie/PosterImage';
import ShowsBrowser from '@/features/shows/ShowsBrowser';
import { useGetMovieQuery } from '@/features/movies/moviesApi';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { isMissing } from '@/utils/getErrorMessage';
import { formatDuration, formatReleaseDate } from '@/utils/format';
import styles from './MovieDetailsPage.module.css';

export default function MovieDetailsPage() {
  const { slug } = useParams();
  const { data: movie, isLoading, isError, error } = useGetMovieQuery(slug);

  if (isLoading) return <Loader label="Loading movie" />;

  if (isError) {
    return (
      <EmptyState
        icon={Clapperboard}
        title={isMissing(error) ? 'Movie not found' : 'Could not load this movie'}
        message="It may have been removed, or the API is unreachable."
        action={<Button to={ROUTES.MOVIES}>Browse movies</Button>}
      />
    );
  }

  const hasRating = movie.ratingCount > 0;

  return (
    <>
      <section className={styles.hero}>
        <div className={cx('container', styles.inner)}>
          <div className={styles.poster}>
            <PosterImage movie={movie} />
          </div>

          <div className={styles.info}>
            <div className={styles.badges}>
              {hasRating && (
                <span className={cx(styles.badge, styles.rating)}>
                  <Star size={13} fill="currentColor" /> {movie.ratingAverage.toFixed(1)}
                  <span className={styles.count}>({movie.ratingCount})</span>
                </span>
              )}
              <span className={styles.badge}>{movie.certificate}</span>
              <span className={styles.badge}>
                <Clock size={13} /> {formatDuration(movie.durationMinutes)}
              </span>
              {movie.status === 'UPCOMING' && (
                <span className={cx(styles.badge, styles.rating)}>
                  Releasing {formatReleaseDate(movie.releaseDate)}
                </span>
              )}
            </div>

            <h1 className={styles.title}>{movie.title}</h1>

            <ul className={styles.chips}>
              {movie.genres.map((genre) => (
                <li key={genre}>
                  <Link to={`${ROUTES.MOVIES}?genre=${encodeURIComponent(genre)}`}>{genre}</Link>
                </li>
              ))}
            </ul>
            <p className={styles.languages}>{movie.languages.join(' · ')}</p>
            <p className={styles.description}>{movie.description}</p>

            {movie.director && (
              <p className={styles.credit}>
                <strong>Director:</strong> {movie.director}
              </p>
            )}
            {movie.cast.length > 0 && (
              <p className={styles.credit}>
                <strong>Cast:</strong>{' '}
                {movie.cast
                  .map((member) => (member.role ? `${member.name} (${member.role})` : member.name))
                  .join(', ')}
              </p>
            )}

            {movie.trailerUrl && (
              <div>
                <Button href={movie.trailerUrl} variant="secondary">
                  <Play size={16} /> Watch trailer
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={cx('container', styles.shows)}>
        <SectionHeader eyebrow="Book tickets" title="Showtimes" />
        {movie.status === 'ENDED' ? (
          <EmptyState
            icon={Clapperboard}
            title="No longer in theaters"
            message="This movie has finished its run. Browse what is showing now."
            action={<Button to={`${ROUTES.MOVIES}?status=NOW_SHOWING`}>Now showing</Button>}
          />
        ) : (
          <ShowsBrowser filters={{ movieId: movie.id }} groupBy="theater" applyCity />
        )}
      </section>
    </>
  );
}
