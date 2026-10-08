import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Armchair, CalendarX, TriangleAlert } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import SeatGrid from '@/features/bookings/SeatGrid';
import { useCreateBookingMutation } from '@/features/bookings/bookingsApi';
import CouponBox from '@/features/coupons/CouponBox';
import { useCoupon } from '@/features/coupons/useCoupon';
import { useGetSeatMapQuery, useGetShowQuery } from '@/features/shows/showsApi';
import { useAuth } from '@/hooks/useAuth';
import { useNow } from '@/hooks/useNow';
import { MAX_SEATS_PER_BOOKING, SEAT_STATUS } from '@/constants/booking';
import { ROUTES, checkoutPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import { getErrorMessage, isMissing } from '@/utils/getErrorMessage';
import page from './page.module.css';
import styles from './SeatSelectionPage.module.css';

const POLL_INTERVAL_MS = 10000;

export default function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = useNow(30000);
  const [selected, setSelected] = useState([]);

  const show = useGetShowQuery(id);
  const seatMap = useGetSeatMapQuery(id, {
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  });
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

  const seats = useMemo(() => seatMap.data?.seats ?? [], [seatMap.data]);

  // Only seats that are still available count, so a seat taken by someone else drops out.
  const selectedSeats = useMemo(
    () =>
      seats.filter(
        (seat) => selected.includes(seat.seatLabel) && seat.status === SEAT_STATUS.AVAILABLE,
      ),
    [seats, selected],
  );
  const selectedLabels = useMemo(
    () => selectedSeats.map((seat) => seat.seatLabel),
    [selectedSeats],
  );
  const subtotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    [selectedSeats],
  );
  const coupon = useCoupon(subtotal);

  if (show.isLoading || seatMap.isLoading) return <Loader label="Loading seats" />;

  if (show.isError || seatMap.isError) {
    return (
      <EmptyState
        icon={CalendarX}
        title={isMissing(show.error) ? 'Show not found' : 'Could not load this show'}
        message="It may have been cancelled, or the API is unreachable."
        action={<Button to={ROUTES.MOVIES}>Browse movies</Button>}
      />
    );
  }

  const showData = show.data;
  const isClosed = showData.status !== 'SCHEDULED' || new Date(showData.startTime).getTime() <= now;
  const lostCount = selected.length - selectedSeats.length;
  const payable = Math.max(0, subtotal - coupon.discount);
  const maxReached = selectedLabels.length >= MAX_SEATS_PER_BOOKING;
  const canProceed = selectedSeats.length > 0 && !isClosed && user.isVerified && !coupon.isChecking;

  const toggleSeat = (label) => {
    if (selectedLabels.includes(label)) {
      setSelected(selectedLabels.filter((item) => item !== label));
    } else if (selectedLabels.length < MAX_SEATS_PER_BOOKING) {
      setSelected([...selectedLabels, label]);
    }
  };

  const handleProceed = async () => {
    try {
      const booking = await createBooking({
        showId: id,
        seats: selectedLabels,
        couponCode: coupon.code,
      }).unwrap();
      navigate(checkoutPath(booking.id));
    } catch (error) {
      toast.error(getErrorMessage(error), { duration: 6000 });
      setSelected([]);
    }
  };

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>{showData.movie.title}</h1>
        <p className={page.subtitle}>
          {showData.theater.name}, {showData.theater.city} · {showData.screen.name} ·{' '}
          {formatShowDateTime(showData.startTime)} · {showData.format} · {showData.language}
        </p>
      </header>

      {isClosed && (
        <p className={styles.notice} role="status">
          <TriangleAlert size={16} /> Bookings are closed for this show.
        </p>
      )}

      <div className={styles.layout}>
        <SeatGrid
          seatMap={seatMap.data}
          selectedLabels={selectedLabels}
          maxReached={maxReached}
          onToggle={toggleSeat}
        />

        <aside className={styles.summary} aria-live="polite">
          <h2 className={styles.summaryTitle}>
            <Armchair size={18} /> Your seats
          </h2>

          {selectedSeats.length === 0 ? (
            <p className={styles.muted}>Pick up to {MAX_SEATS_PER_BOOKING} seats from the map.</p>
          ) : (
            <>
              <p className={styles.seatList}>{selectedLabels.join(', ')}</p>
              <p className={styles.total}>
                {formatCurrency(payable)} <small>before convenience fee</small>
              </p>
              {coupon.discount > 0 && (
                <p className={styles.muted}>
                  Includes coupon savings of {formatCurrency(coupon.discount)}.
                </p>
              )}
            </>
          )}

          {lostCount > 0 && (
            <p className={styles.warning} role="status">
              {lostCount === 1 ? 'A seat you picked was' : `${lostCount} seats you picked were`}{' '}
              just taken.
            </p>
          )}
          {maxReached && (
            <p className={styles.muted}>You have reached the {MAX_SEATS_PER_BOOKING}-seat limit.</p>
          )}
          {!user.isVerified && (
            <p className={styles.warning}>Verify your email to book. Use the banner at the top.</p>
          )}

          <CouponBox coupon={coupon} disabled={isBooking} />

          <Button
            onClick={handleProceed}
            loading={isBooking}
            disabled={!canProceed}
            fullWidth
            size="lg"
          >
            Proceed to pay
          </Button>
          <p className={styles.muted}>Seats are held for you while you pay.</p>
          <Link to={ROUTES.BOOKINGS} className={styles.link}>
            Have a pending booking? View my bookings
          </Link>
        </aside>
      </div>
    </div>
  );
}
