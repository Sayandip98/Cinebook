import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Ticket } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import BookingSummary from '@/features/bookings/BookingSummary';
import StatusBadge from '@/features/bookings/StatusBadge';
import {
  useCancelBookingMutation,
  useGetBookingQuery,
  useGetTicketQuery,
} from '@/features/bookings/bookingsApi';
import { useNow } from '@/hooks/useNow';
import { BOOKING_STATUS } from '@/constants/booking';
import { ROUTES, checkoutPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { formatCurrency, formatShowDateTime } from '@/utils/format';
import { getErrorMessage, isMissing } from '@/utils/getErrorMessage';
import { getRefundHint } from '@/utils/refundHint';
import page from './page.module.css';
import styles from './BookingDetailsPage.module.css';

const MINUTE_MS = 60 * 1000;

export default function BookingDetailsPage() {
  const { id } = useParams();
  const now = useNow(MINUTE_MS);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: booking, isLoading, isError, error } = useGetBookingQuery(id);
  const isConfirmed = booking?.status === BOOKING_STATUS.CONFIRMED;
  const { data: ticket } = useGetTicketQuery(id, { skip: !isConfirmed });
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  if (isLoading) return <Loader label="Loading booking" />;

  if (isError) {
    return (
      <EmptyState
        icon={Ticket}
        title={isMissing(error) ? 'Booking not found' : 'Could not load this booking'}
        action={<Button to={ROUTES.BOOKINGS}>My bookings</Button>}
      />
    );
  }

  const isPending = booking.status === BOOKING_STATUS.PENDING;
  const holdActive = isPending && new Date(booking.expiresAt).getTime() > now;
  const refund = isConfirmed ? getRefundHint(booking.show.startTime, now) : null;
  const refundAmount = refund?.percent ? Math.round(booking.totalAmount * refund.percent) / 100 : 0;
  const canCancel = holdActive || (isConfirmed && !booking.checkedInAt && refund?.percent);

  const handleCancel = async () => {
    try {
      const { message } = await cancelBooking(booking.id).unwrap();
      toast.success(message, { duration: 6000 });
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Booking details</h1>
        <p className={styles.headLine}>
          {booking.bookingCode} <StatusBadge status={booking.status} />
        </p>
      </header>

      <div className={styles.layout}>
        {isConfirmed && (
          <section className={styles.ticket}>
            <p className={styles.ticketLabel}>Show this QR at the entrance</p>
            <div className={styles.qrBox}>
              {ticket ? (
                <img src={ticket.qrCode} alt={`QR code for booking ${booking.bookingCode}`} />
              ) : (
                <Loader label="Loading ticket" />
              )}
            </div>
            <p className={styles.code}>{booking.bookingCode}</p>
            {booking.checkedInAt && (
              <p className={styles.used}>Used on {formatShowDateTime(booking.checkedInAt)}</p>
            )}
          </section>
        )}

        <div className={styles.column}>
          <BookingSummary booking={booking} />

          {holdActive && (
            <div className={styles.notice}>
              <p>Your seats are held. Complete the payment before the timer runs out.</p>
              <Button to={checkoutPath(booking.id)}>Continue to payment</Button>
            </div>
          )}
          {isPending && !holdActive && (
            <p className={styles.notice}>The hold on these seats has ended. Please book again.</p>
          )}

          {booking.refundAmount > 0 && (
            <p className={styles.notice}>
              Refund: {formatCurrency(booking.refundAmount)} to your original payment method.
            </p>
          )}

          {isConfirmed && refund && <p className={styles.hint}>{refund.text}</p>}

          <div className={styles.actions}>
            {canCancel && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Cancel booking
              </Button>
            )}
            <Link to={ROUTES.BOOKINGS} className={styles.back}>
              Back to my bookings
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message={
          isConfirmed
            ? `You will be refunded ${formatCurrency(refundAmount)} (${refund?.percent}%). This cannot be undone.`
            : 'Your seats will be released and others can book them.'
        }
        confirmLabel="Cancel booking"
        loading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
