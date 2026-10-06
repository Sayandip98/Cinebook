import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, MapPin } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import SearchField from '@/components/common/SearchField';
import Skeleton from '@/components/common/Skeleton';
import { useGetTheatersQuery } from '@/features/theaters/theatersApi';
import { selectCity } from '@/features/ui/uiSlice';
import { theaterDetailsPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import page from './page.module.css';
import styles from './TheatersPage.module.css';

const PAGE_SIZE = 9;

export default function TheatersPage() {
  const city = useSelector(selectCity);
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetTheatersQuery({
    page: pageNumber,
    limit: PAGE_SIZE,
    city: city || undefined,
    search: search || undefined,
    sort: 'name_asc',
  });

  const handleSearch = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  let content;
  if (isLoading) {
    content = (
      <div className={styles.cards}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} style={{ height: '10rem' }} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={Building2}
        title="Could not load theaters"
        message="Please check that the API is running and try again."
      />
    );
  } else if (data.theaters.length === 0) {
    content = (
      <EmptyState
        icon={Building2}
        title="No theaters found"
        message={city ? `We have no matching theaters in ${city}.` : 'Try a different search.'}
      />
    );
  } else {
    content = (
      <>
        <div className={cx(styles.cards, isFetching && page.busy)}>
          {data.theaters.map((theater) => (
            <article key={theater.id} className={styles.card}>
              <h2 className={styles.name}>{theater.name}</h2>
              <p className={styles.address}>
                <MapPin size={14} /> {theater.address}, {theater.city}
              </p>
              {theater.amenities.length > 0 && (
                <ul className={styles.tags}>
                  {theater.amenities.slice(0, 4).map((amenity) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
              )}
              <Button to={theaterDetailsPath(theater.id)} variant="secondary" size="sm">
                View shows
              </Button>
            </article>
          ))}
        </div>
        <Pagination meta={data.meta} onPageChange={setPageNumber} />
      </>
    );
  }

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Theaters</h1>
        <p className={page.subtitle}>
          {city ? `Showing theaters in ${city}.` : 'Showing theaters in every city.'}{' '}
          <Link to="/movies">Browse movies instead</Link>
        </p>
      </header>
      <div className={page.toolbar}>
        <SearchField value={search} onSubmit={handleSearch} placeholder="Search theaters" />
      </div>
      {content}
    </div>
  );
}
