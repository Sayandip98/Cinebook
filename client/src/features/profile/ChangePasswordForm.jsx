import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import { useChangePasswordMutation } from '@/features/users/usersApi';
import styles from './profile.module.css';

export default function ChangePasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setFormError('');
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password changed. Other devices were signed out.');
      reset();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Change password</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <p className={styles.alert} role="alert">
            {formError}
          </p>
        )}
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Enter your current password' })}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Enter a new password',
            minLength: { value: 8, message: 'At least 8 characters' },
            maxLength: { value: 72, message: 'At most 72 characters' },
            validate: (value) =>
              (/[A-Za-z]/.test(value) && /\d/.test(value)) ||
              'Use at least one letter and one number',
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm the new password',
            validate: (value) => value === getValues('newPassword') || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={isLoading}>
          Update password
        </Button>
      </form>
    </section>
  );
}
