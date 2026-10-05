import { useEffect, useState } from 'react';
import { Clock, Play, Star, Ticket } from 'lucide-react';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import PosterImage from '@/components/movie/PosterImage';
import { ROUTES, movieDetailsPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { formatDuration } from '@/utils/format';
import styles from './HeroCarousel.module.css';

const SLIDE_INTERVAL_MS = 6000;

export default function HeroCarousel({ movies, isLoading }) {
  const [index, setIndex] = useState(0);
  const count = movies.length;

  // Depending on `index` restarts the timer whenever the user picks a slide.
  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [count, index]);

  if (isLoading) {
    return (
      <section className={styles.hero}>
        <div className={cx('container', styles.inner)}>
          <div className={styles.copy}>
            <Skeleton style={{ height: '1.5rem', width: '40%' }} />
            <Skeleton style={{ height: '4rem', width: '80%' }} />
            <Skeleton style={{ height: '5rem', width: '90%' }} />
          </div>
        </div>
      </section>
    );
  }

  if (count === 0) {
    return (
      <section className={styles.hero}>
        <div className={cx('container', styles.inner)}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Welcome to CineBook</p>
            <h1 className={styles.title}>Your next movie night starts here</h1>
            <p className={styles.description}>
              Browse movies, pick your exact seats and pay securely, all in a few taps.
            </p>
            <div className={styles.actions}>
              <Button to={ROUTES.MOVIES} size="lg">
                <Ticket size={18} /> Browse movies
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const movie = movies[index % count];
  const hasRating = movie.ratingCount > 0;

  return (
    <section className={styles.hero} aria-roledescription="carousel" aria-label="Featured movies">
      <div className={cx('container', styles.inner)}>
        <div key={movie.id} className={styles.slide}>
          <div className={styles.copy}>
            <div className={styles.badges}>
              {hasRating && (
                <span className={cx(styles.badge, styles.rating)}>
                  <Star size={13} fill="currentColor" /> {movie.ratingAverage.toFixed(1)}
                </span>
              )}
              <span className={styles.badge}>{movie.certificate}</span>
              <span className={styles.badge}>
                <Clock size={13} /> {formatDuration(movie.durationMinutes)}
              </span>
            </div>
            <h1 className={styles.title}>{movie.title}</h1>
            <p className={styles.meta}>
              {movie.genres.join(' · ')} <span aria-hidden="true">•</span>{' '}
              {movie.languages.join(', ')}
            </p>
            <p className={styles.description}>{movie.description}</p>
            <div className={styles.actions}>
              <Button to={movieDetailsPath(movie.slug)} size="lg">
                <Ticket size={18} /> Book tickets
              </Button>
              {movie.trailerUrl && (
                <Button href={movie.trailerUrl} variant="secondary" size="lg">
                  <Play size={18} /> Watch trailer
                </Button>
              )}
            </div>
          </div>

          <div className={styles.posterCard}>
            <PosterImage movie={movie} />
          </div>
        </div>

        {count > 1 && (
          <div className={styles.dots}>
            {movies.map((item, position) => (
              <button
                key={item.id}
                type="button"
                className={cx(styles.dot, position === index % count && styles.dotActive)}
                onClick={() => setIndex(position)}
                aria-label={`Show ${item.title}`}
                aria-current={position === index % count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
