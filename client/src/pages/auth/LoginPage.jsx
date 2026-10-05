import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useLoginMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import styles from './auth.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const redirectTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search}`
    : ROUTES.HOME;

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await login(values).unwrap();
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to book your next movie.</p>

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
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email' },
          })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <Link to={ROUTES.FORGOT_PASSWORD} className={`${styles.link} ${styles.inlineLink}`}>
          Forgot password?
        </Link>
        <Button type="submit" loading={isLoading} fullWidth size="lg">
          Sign in
        </Button>
      </form>

      <p className={styles.footerText}>
        New to CineBook?{' '}
        <Link to={ROUTES.REGISTER} className={styles.link}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
