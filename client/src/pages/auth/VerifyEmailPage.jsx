import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX } from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import { useVerifyEmailMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { cx } from '@/utils/classNames';
import styles from './auth.module.css';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { isAuthenticated } = useAuth();
  const [verifyEmail, { isSuccess, isError }] = useVerifyEmailMutation();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;
    verifyEmail({ token });
  }, [token, verifyEmail]);

  if (token && !isSuccess && !isError) {
    return (
      <div className={styles.card}>
        <Loader label="Verifying your email" />
        <p className={styles.footerText}>Verifying your email...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cx(styles.card, styles.success)}>
        <span className={styles.successIcon}>
          <CircleCheck size={28} />
        </span>
        <h1 className={styles.title}>Email verified</h1>
        <p className={styles.muted}>Your account is ready. You can now book tickets.</p>
        <Button to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} fullWidth>
          {isAuthenticated ? 'Start browsing' : 'Sign in'}
        </Button>
      </div>
    );
  }

  return (
    <div className={cx(styles.card, styles.success)}>
      <span className={cx(styles.successIcon, styles.errorIcon)}>
        <CircleX size={28} />
      </span>
      <h1 className={styles.title}>Link invalid or expired</h1>
      <p className={styles.muted}>
        Sign in and use "Resend email" in the banner at the top to get a fresh link.
      </p>
      <Button to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} fullWidth variant="secondary">
        {isAuthenticated ? 'Back to home' : 'Go to sign in'}
      </Button>
    </div>
  );
}
