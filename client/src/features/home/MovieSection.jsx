import { Clapperboard } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';
import Skeleton from '@/components/common/Skeleton';
import MovieCard from '@/components/movie/MovieCard';
import styles from './MovieSection.module.css';

const SKELETON_COUNT = 5;

export default function MovieSection({
  eyebrow,
  title,
  movies,
  isLoading,
  isError,
  actionTo,
  showRelease = false,
}) {
  let content;

  if (isLoading) {
    content = (
      <div className={styles.row}>
        {Array.from({ length: SKELETON_COUNT }, (_, position) => (
          <Skeleton key={position} className={styles.skeleton} />
        ))}
      </div>
    );
  } else if (isError || movies.length === 0) {
    content = (
      <EmptyState
        icon={Clapperboard}
        title={isError ? 'Could not load movies' : 'Nothing here yet'}
        message={
          isError ? 'Please check that the API is running and try again.' : 'Check back soon.'
        }
      />
    );
  } else {
    content = (
      <div className={styles.row}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} showRelease={showRelease} />
        ))}
      </div>
    );
  }

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeader eyebrow={eyebrow} title={title} actionLabel="View all" actionTo={actionTo} />
      {content}
    </section>
  );
}
