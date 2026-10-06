import { useParams } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import SectionHeader from '@/components/common/SectionHeader';
import ShowsBrowser from '@/features/shows/ShowsBrowser';
import { useGetTheaterQuery } from '@/features/theaters/theatersApi';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { isMissing } from '@/utils/getErrorMessage';
import page from './page.module.css';
import styles from './TheatersPage.module.css';

export default function TheaterDetailsPage() {
  const { id } = useParams();
  const { data: theater, isLoading, isError, error } = useGetTheaterQuery(id);

  if (isLoading) return <Loader label="Loading theater" />;

  if (isError) {
    return (
      <EmptyState
        icon={Building2}
        title={isMissing(error) ? 'Theater not found' : 'Could not load this theater'}
        action={<Button to={ROUTES.THEATERS}>All theaters</Button>}
      />
    );
  }

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>{theater.name}</h1>
        <p className={styles.address}>
          <MapPin size={14} /> {theater.address}, {theater.city}
          {theater.pincode ? ` - ${theater.pincode}` : ''}
        </p>
        {theater.amenities.length > 0 && (
          <ul className={styles.tags} style={{ marginTop: 'var(--space-3)' }}>
            {theater.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        )}
      </header>

      <SectionHeader eyebrow="Book tickets" title="Showtimes" />
      <ShowsBrowser filters={{ theaterId: theater.id }} groupBy="movie" />
    </div>
  );
}
