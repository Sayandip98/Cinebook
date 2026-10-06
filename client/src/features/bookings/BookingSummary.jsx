import PosterImage from '@/components/movie/PosterImage';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import styles from './BookingSummary.module.css';

export default function BookingSummary({ booking }) {
  const { show } = booking;
  const seatLabels = booking.seats.map((seat) => seat.seatLabel).join(', ');

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <div className={styles.thumb}>
          <PosterImage movie={show.movie} />
        </div>
        <div>
          <h2 className={styles.title}>{show.movie.title}</h2>
          <p className={styles.meta}>
            {show.format} · {show.language}
          </p>
          <p className={styles.meta}>
            {show.theater.name}, {show.theater.city}
          </p>
          <p className={styles.meta}>
            {show.screen.name} · {formatShowDateTime(show.startTime)}
          </p>
        </div>
      </div>

      <dl className={styles.rows}>
        <div>
          <dt>Seats</dt>
          <dd>{seatLabels}</dd>
        </div>
        <div>
          <dt>Tickets ({booking.seats.length})</dt>
          <dd>{formatCurrency(booking.subtotal)}</dd>
        </div>
        {booking.discount > 0 && (
          <div>
            <dt>Discount</dt>
            <dd>-{formatCurrency(booking.discount)}</dd>
          </div>
        )}
        <div>
          <dt>Convenience fee</dt>
          <dd>{formatCurrency(booking.convenienceFee)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatCurrency(booking.totalAmount)}</dd>
        </div>
      </dl>
    </section>
  );
}
