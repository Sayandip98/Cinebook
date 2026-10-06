import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
// import StatusBadge from '@/features/bookings/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { applyFieldErrors, getErrorMessage } from '@/utils/getErrorMessage';
import { useUpdateProfileMutation } from '@/features/users/usersApi';
import styles from './profile.module.css';

const PHONE_PATTERN = /^\+?[0-9]{10,15}$/;

export default function ProfileForm() {
  const { user } = useAuth();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { name: user.name, phone: user.phone ?? '' } });

  const onSubmit = async ({ name, phone }) => {
    setFormError('');
    try {
      await updateProfile({ name, ...(phone ? { phone } : {}) }).unwrap();
      toast.success('Profile updated');
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(getErrorMessage(error));
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Your details</h2>
      <span>{user.isVerified ? 'Email verified' : 'Email not verified'}</span>
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
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone', {
            validate: (value) => !value || PHONE_PATTERN.test(value) || 'Enter 10-15 digits',
          })}
        />
        <Button type="submit" loading={isLoading} disabled={!isDirty}>
          Save changes
        </Button>
      </form>
    </section>
  );
}
