import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useRegisterMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import styles from './auth.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

export default function RegisterPage() {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ confirmPassword: _confirm, phone, ...values }) => {
    setFormError('');
    try {
      await registerUser({ ...values, ...(phone ? { phone } : {}) }).unwrap();
      setRegisteredEmail(values.email);
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  if (registeredEmail) {
    return (
      <div className={`${styles.card} ${styles.success}`}>
        <span className={styles.successIcon}>
          <MailCheck size={28} />
        </span>
        <h1 className={styles.title}>Check your inbox</h1>
        <p className={styles.muted}>
          We sent a verification link to <strong>{registeredEmail}</strong>. Verify your email, then
          sign in to start booking.
        </p>
        <Button to={ROUTES.LOGIN} fullWidth>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>It takes less than a minute.</p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className={styles.alert} role="alert">
            {formError}
          </p>
        )}
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
            maxLength: { value: 60, message: 'At most 60 characters' },
          })}
        />
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
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="9876543210"
          error={errors.phone?.message}
          {...register('phone', {
            validate: (value) => !value || PHONE_PATTERN.test(value) || 'Enter 10-15 digits',
          })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            maxLength: { value: 72, message: 'At most 72 characters' },
            validate: (value) =>
              (/[A-Za-z]/.test(value) && /\d/.test(value)) ||
              'Use at least one letter and one number',
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === getValues('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Create account
        </Button>
      </form>

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className={styles.link}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
