import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, ShieldCheck, TimerOff } from 'lucide-react';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import BookingSummary from '@/features/bookings/BookingSummary';
import { useCancelBookingMutation, useGetBookingQuery } from '@/features/bookings/bookingsApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '@/features/payments/paymentsApi';
import { loadRazorpay } from '@/features/payments/loadRazorpay';
import { useAuth } from '@/hooks/useAuth';
import { useCountdown } from '@/hooks/useCountdown';
import { BOOKING_STATUS } from '@/constants/booking';
import { ROUTES, bookingDetailsPath, showSeatsPath } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import { getErrorMessage, isMissing } from '@/utils/getErrorMessage';
import page from './page.module.css';
import styles from './CheckoutPage.module.css';

const URGENT_SECONDS = 60;
const BRAND_COLOR = '#6d28d9';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: booking, isLoading, isError, error } = useGetBookingQuery(id);
  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [isPaying, setIsPaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPending = booking?.status === BOOKING_STATUS.PENDING;
  const { secondsLeft, isExpired, label } = useCountdown(isPending ? booking.expiresAt : null);

  if (isLoading) return <Loader label="Loading your booking" />;

  if (isError) {
    return (
      <EmptyState
        icon={TimerOff}
        title={isMissing(error) ? 'Booking not found' : 'Could not load this booking'}
        action={<Button to={ROUTES.BOOKINGS}>My bookings</Button>}
      />
    );
  }

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    return <Navigate to={bookingDetailsPath(booking.id)} replace />;
  }

  if (!isPending || isExpired) {
    return (
      <EmptyState
        icon={TimerOff}
        title={
          isPending || booking.status === BOOKING_STATUS.EXPIRED
            ? 'Your seats were released'
            : `Booking ${booking.status.toLowerCase()}`
        }
        message="This booking can no longer be paid for. Choose your seats again to continue."
        action={<Button to={showSeatsPath(booking.show.id)}>Choose seats again</Button>}
      />
    );
  }

  const finishPayment = async (response) => {
    try {
      const confirmed = await verifyPayment(response).unwrap();
      toast.success('Payment successful! Your tickets are ready.');
      navigate(bookingDetailsPath(confirmed.id), { replace: true });
    } catch (verifyError) {
      toast.error(getErrorMessage(verifyError), { duration: 8000 });
      navigate(ROUTES.BOOKINGS, { replace: true });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePay = async () => {
    setIsPaying(true);
    try {
      if (!(await loadRazorpay())) {
        toast.error('Could not load the payment window. Check your connection and try again.');
        setIsPaying(false);
        return;
      }

      const order = await createOrder(booking.id).unwrap();
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'CineBook',
        description: `Booking ${order.bookingCode}`,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: BRAND_COLOR },
        handler: finishPayment,
        modal: { ondismiss: () => setIsPaying(false) },
      });
      checkout.on('payment.failed', (response) => {
        toast.error(response.error?.description ?? 'Payment failed. You can try again.');
      });
      checkout.open();
    } catch (payError) {
      toast.error(getErrorMessage(payError));
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking(booking.id).unwrap();
      toast.success('Booking cancelled. Your seats were released.');
      navigate(showSeatsPath(booking.show.id), { replace: true });
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
      setConfirmOpen(false);
    }
  };

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Checkout</h1>
        <p className={page.subtitle}>Booking {booking.bookingCode}</p>
      </header>

      <div className={styles.layout}>
        <BookingSummary booking={booking} />

        <div className={styles.side}>
          <div
            className={cx(styles.timer, secondsLeft <= URGENT_SECONDS && styles.urgent)}
            role="timer"
            aria-live="off"
          >
            <span className={styles.timerLabel}>
              <Clock size={18} /> Seats held for
            </span>
            <span className={styles.clock}>{label}</span>
          </div>

          <div className={styles.pay}>
            <Button onClick={handlePay} loading={isPaying} fullWidth size="lg">
              Pay securely
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(true)}
              disabled={isPaying}
              fullWidth
            >
              Cancel booking
            </Button>
            <p className={styles.note}>
              <ShieldCheck size={14} /> Payments are processed by Razorpay in test mode. Use test
              card details only.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message="Your seats will be released and others can book them."
        confirmLabel="Cancel booking"
        loading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
