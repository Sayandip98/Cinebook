import { Link, useSearchParams } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import Skeleton from '@/components/common/Skeleton';
import PosterImage from '@/components/movie/PosterImage';
import StatusBadge from '@/features/bookings/StatusBadge';
import { useGetMyBookingsQuery } from '@/features/bookings/bookingsApi';
import { BOOKING_STATUS_OPTIONS } from '@/constants/booking';
import { ROUTES, bookingDetailsPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import page from './page.module.css';
import styles from './MyBookingsPage.module.css';

const PAGE_SIZE = 8;

export default function MyBookingsPage() {
  const [params, setParams] = useSearchParams();
  const status = BOOKING_STATUS_OPTIONS.some((option) => option.value === params.get('status'))
    ? params.get('status')
    : '';
  const currentPage = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);

  const { data, isLoading, isFetching, isError } = useGetMyBookingsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    status: status || undefined,
  });

  const setParam = (key, value) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  let content;
  if (isLoading) {
    content = (
      <ul className={page.list}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} style={{ height: '8rem' }} />
        ))}
      </ul>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={Ticket}
        title="Could not load your bookings"
        message="Please try again shortly."
      />
    );
  } else if (data.bookings.length === 0) {
    content = (
      <EmptyState
        icon={Ticket}
        title={status ? 'No bookings with this status' : 'No bookings yet'}
        message="Find a movie you like and book your first seats."
        action={<Button to={ROUTES.MOVIES}>Browse movies</Button>}
      />
    );
  } else {
    content = (
      <>
        <ul className={cx(page.list, isFetching && page.busy)}>
          {data.bookings.map((booking) => (
            <li key={booking.id}>
              <Link to={bookingDetailsPath(booking.id)} className={styles.card}>
                <div className={styles.poster}>
                  <PosterImage movie={booking.show.movie} />
                </div>
                <div className={styles.body}>
                  <div className={styles.top}>
                    <h2 className={styles.title}>{booking.show.movie.title}</h2>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className={styles.meta}>
                    {booking.show.theater.name}, {booking.show.theater.city}
                  </p>
                  <p className={styles.meta}>
                    {formatShowDateTime(booking.show.startTime)} ·{' '}
                    {booking.seats.map((seat) => seat.seatLabel).join(', ')}
                  </p>
                  <p className={styles.code}>
                    {booking.bookingCode} · {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Pagination meta={data.meta} onPageChange={(value) => setParam('page', String(value))} />
      </>
    );
  }

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>My bookings</h1>
        <p className={page.subtitle}>Your tickets and payment history.</p>
      </header>
      <div className={page.toolbar}>
        <FilterSelect
          label="Filter by status"
          value={status}
          options={BOOKING_STATUS_OPTIONS}
          onChange={(value) => setParam('status', value)}
        />
      </div>
      {content}
    </div>
  );
}
