import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, MapPin, ShieldCheck, Ticket, Zap } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import SectionHeader from '@/components/common/SectionHeader';
import Skeleton from '@/components/common/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useGetTheatersQuery } from '@/features/theaters/theatersApi';
import { selectCity } from '@/features/ui/uiSlice';
import { ROUTES, theaterDetailsPath } from '@/constants/routes';
import styles from './TheaterSpotlight.module.css';

const SPOTLIGHT_COUNT = 3;

export default function TheaterSpotlight() {
  const city = useSelector(selectCity);
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useGetTheatersQuery({
    city: city || undefined,
    limit: SPOTLIGHT_COUNT,
    sort: 'name_asc',
  });
  const theaters = data?.theaters ?? [];

  let list;
  if (isLoading) {
    list = Array.from({ length: SPOTLIGHT_COUNT }, (_, position) => (
      <Skeleton key={position} style={{ height: '5.5rem' }} />
    ));
  } else if (isError || theaters.length === 0) {
    list = (
      <EmptyState
        icon={Building2}
        title="No theaters found"
        message={city ? `We have no theaters in ${city} yet.` : 'Please try again shortly.'}
      />
    );
  } else {
    list = theaters.map((theater) => (
      <article key={theater.id} className={styles.item}>
        <span className={styles.itemIcon}>
          <Building2 size={20} />
        </span>
        <div className={styles.itemBody}>
          <h3 className={styles.itemName}>{theater.name}</h3>
          <p className={styles.itemMeta}>
            <MapPin size={13} /> {theater.address}, {theater.city}
          </p>
          {theater.amenities.length > 0 && (
            <ul className={styles.tags}>
              {theater.amenities.slice(0, 3).map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          )}
        </div>
        <Button to={theaterDetailsPath(theater.id)} size="sm" variant="secondary">
          View shows
        </Button>
      </article>
    ));
  }

  return (
    <section className={`container ${styles.section}`}>
      <SectionHeader
        eyebrow={city ? `${city} spotlight` : 'Spotlight'}
        title="Top theaters"
        actionLabel="All theaters"
        actionTo={ROUTES.THEATERS}
      />
      <div className={styles.layout}>
        <div className={styles.list}>{list}</div>

        <aside className={styles.promo}>
          <p className={styles.promoEyebrow}>Why CineBook</p>
          <h3 className={styles.promoTitle}>Book in under a minute</h3>
          <ul className={styles.perks}>
            <li>
              <Ticket size={16} /> Choose up to 6 seats on a live map
            </li>
            <li>
              <Zap size={16} /> Seats held for you while you pay
            </li>
            <li>
              <ShieldCheck size={16} /> Secure payments and instant e-tickets
            </li>
          </ul>
          {!isAuthenticated && (
            <Button to={ROUTES.REGISTER} fullWidth>
              Create free account
            </Button>
          )}
          <Link to={ROUTES.MOVIES} className={styles.promoLink}>
            Browse movies
          </Link>
        </aside>
      </div>
    </section>
  );
}
