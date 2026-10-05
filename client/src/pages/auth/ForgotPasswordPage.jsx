import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import styles from './auth.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [formError, setFormError] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      setSentMessage(await forgotPassword(values).unwrap());
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  if (sentMessage) {
    return (
      <div className={`${styles.card} ${styles.success}`}>
        <span className={styles.successIcon}>
          <MailCheck size={28} />
        </span>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.muted}>{sentMessage}</p>
        <Button to={ROUTES.LOGIN} fullWidth variant="secondary">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Forgot password?</h1>
      <p className={styles.subtitle}>Enter your email and we will send a reset link.</p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className={styles.alert} role="alert">
            {formError}
          </p>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email' },
          })}
        />
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Send reset link
        </Button>
      </form>

      <p className={styles.footerText}>
        <Link to={ROUTES.LOGIN} className={styles.link}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
