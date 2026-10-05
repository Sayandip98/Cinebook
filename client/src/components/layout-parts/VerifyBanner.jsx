import toast from 'react-hot-toast';
import { MailWarning } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useResendVerificationMutation } from '@/features/auth/authApi';
import { getErrorMessage } from '@/utils/getErrorMessage';
import styles from './VerifyBanner.module.css';

export default function VerifyBanner() {
  const { user } = useAuth();
  const [resend, { isLoading }] = useResendVerificationMutation();

  if (!user || user.isVerified) return null;

  const handleResend = async () => {
    try {
      await resend({ email: user.email }).unwrap();
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className={styles.banner} role="status">
      <MailWarning size={16} aria-hidden="true" />
      <span>Verify your email to start booking tickets.</span>
      <button type="button" className={styles.button} onClick={handleResend} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Resend email'}
      </button>
    </div>
  );
}
