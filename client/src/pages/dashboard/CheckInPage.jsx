import { useRef, useState } from 'react';
import { CircleAlert, CircleCheck, ScanLine } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useCheckInMutation } from '@/features/dashboard/dashboardApi';
import { formatShowDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cx } from '@/utils/classNames';
import styles from '@/features/dashboard/dashboard.module.css';
import checkin from './CheckInPage.module.css';

const HISTORY_LIMIT = 5;

export default function CheckInPage() {
  const inputRef = useRef(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [checkIn, { isLoading }] = useCheckInMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const bookingCode = code.trim().toUpperCase();
    if (!bookingCode) return;

    setError('');
    try {
      const booking = await checkIn(bookingCode).unwrap();
      setResult(booking);
      setHistory((previous) => [booking, ...previous].slice(0, HISTORY_LIMIT));
    } catch (requestError) {
      setResult(null);
      setError(getErrorMessage(requestError));
    } finally {
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Check-in</h1>
          <p className={styles.sub}>
            Type the booking code or scan the QR with a USB scanner. Check-in opens 3 hours before
            the show.
          </p>
        </div>
      </header>

      <form className={checkin.form} onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          label="Booking code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="CB..."
          autoFocus
          autoComplete="off"
          maxLength={20}
        />
        <Button type="submit" loading={isLoading} size="lg">
          <ScanLine size={18} /> Check in
        </Button>
      </form>

      {error && (
        <p className={cx(checkin.result, checkin.bad)} role="alert">
          <CircleAlert size={20} /> {error}
        </p>
      )}

      {result && (
        <section className={cx(checkin.result, checkin.good)} role="status">
          <CircleCheck size={24} />
          <div className={styles.cell}>
            <strong>{result.show.movie.title}</strong>
            <span>
              {result.user?.name} · Seats {result.seats.map((seat) => seat.seatLabel).join(', ')}
            </span>
            <span className={styles.muted}>
              {result.show.screen.name} · {formatShowDateTime(result.show.startTime)} ·{' '}
              {result.bookingCode}
            </span>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className={checkin.history}>
          <h2 className={styles.fieldsetTitle}>Recent check-ins</h2>
          <ul>
            {history.map((booking) => (
              <li key={booking.id}>
                <strong>{booking.bookingCode}</strong> · {booking.user?.name} ·{' '}
                {booking.seats.map((seat) => seat.seatLabel).join(', ')}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
