import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { movieDetailsPath } from '@/constants/routes';
import { formatReleaseDate } from '@/utils/format';
import PosterImage from './PosterImage';
import styles from './MovieCard.module.css';

export default function MovieCard({ movie, showRelease = false }) {
  const hasRating = movie.ratingCount > 0;

  return (
    <Link to={movieDetailsPath(movie.slug)} className={styles.card}>
      <div className={styles.posterWrap}>
        <PosterImage movie={movie} />
        {hasRating && (
          <span className={styles.rating}>
            <Star size={12} fill="currentColor" /> {movie.ratingAverage.toFixed(1)}
          </span>
        )}
        {showRelease && (
          <span className={styles.release}>Releasing {formatReleaseDate(movie.releaseDate)}</span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{movie.title}</h3>
        <p className={styles.meta}>{movie.genres.slice(0, 2).join(' · ')}</p>
      </div>
    </Link>
  );
}
