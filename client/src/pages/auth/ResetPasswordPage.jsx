import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LinkIcon } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useResetPasswordMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import { cx } from '@/utils/classNames';
import styles from './auth.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = async ({ password }) => {
    setFormError('');
    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Password updated. Please sign in.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      if (error?.data?.errors?.some((item) => item.field === 'token')) {
        setFormError('This reset link is invalid or has expired. Request a new one.');
      } else if (!applyFieldErrors(error, setError)) {
        setFormError(getErrorMessage(error));
      }
    }
  };

  if (!token) {
    return (
      <div className={cx(styles.card, styles.success)}>
        <span className={cx(styles.successIcon, styles.errorIcon)}>
          <LinkIcon size={28} />
        </span>
        <h1 className={styles.title}>Invalid link</h1>
        <p className={styles.muted}>This password reset link is missing its token.</p>
        <Button to={ROUTES.FORGOT_PASSWORD} fullWidth>
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Choose a new password</h1>
      <p className={styles.subtitle}>You will be signed out on all devices.</p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className={styles.alert} role="alert">
            {formError}
          </p>
        )}
        <Input
          label="New password"
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
          Update password
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
