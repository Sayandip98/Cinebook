import { useState } from 'react';
import { cx } from '@/utils/classNames';
import styles from './PosterImage.module.css';

export default function PosterImage({ movie, className }) {
  const [failed, setFailed] = useState(false);
  const url = movie.poster?.url;

  if (!url || failed) {
    return (
      <div className={cx(styles.fallback, className)} role="img" aria-label={movie.title}>
        <span>{movie.title.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${movie.title} poster`}
      className={cx(styles.image, className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
