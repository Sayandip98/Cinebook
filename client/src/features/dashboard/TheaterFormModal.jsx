import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { applyFieldErrors, getErrorDetails } from '@/utils/getErrorMessage';
import { toList } from '@/utils/formHelpers';
import {
  useCreateTheaterMutation,
  useGetAdminUsersQuery,
  useUpdateTheaterMutation,
} from './dashboardApi';
import styles from './dashboard.module.css';

const buildDefaults = (theater) =>
  theater
    ? {
        name: theater.name,
        city: theater.city,
        address: theater.address,
        pincode: theater.pincode ?? '',
        latitude: theater.location.coordinates[1],
        longitude: theater.location.coordinates[0],
        amenities: theater.amenities.join(', '),
        manager: theater.manager ?? '',
      }
    : {
        name: '',
        city: '',
        address: '',
        pincode: '',
        latitude: '',
        longitude: '',
        amenities: '',
        manager: '',
      };

function TheaterForm({ theater, onClose }) {
  const isEdit = Boolean(theater);
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

  const [createTheater, { isLoading: isCreating }] = useCreateTheaterMutation();
  const [updateTheater, { isLoading: isUpdating }] = useUpdateTheaterMutation();
  const managers = useGetAdminUsersQuery(
    { role: ROLES.THEATER_MANAGER, isActive: true, limit: 50 },
    { skip: !isAdmin },
  );
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: buildDefaults(theater) });

  const onSubmit = async (values) => {
    setFormError('');

    const body = {
      name: values.name.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      amenities: toList(values.amenities),
    };
    if (values.pincode) body.pincode = values.pincode;
    if (isAdmin && values.manager && values.manager !== theater?.manager) {
      body.manager = values.manager;
    }

    try {
      if (isEdit) {
        await updateTheater({ id: theater.id, ...body }).unwrap();
        toast.success('Theater updated');
      } else {
        await createTheater(body).unwrap();
        toast.success('Theater created');
      }
      onClose();
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getErrorDetails(error));
    }
  };

  // Wait for the manager options so the saved manager is pre-selected.
  if (isAdmin && managers.isLoading) return <Loader label="Loading managers" />;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p className={styles.alert} role="alert">
          {formError}
        </p>
      )}

      <Input
        label="Name"
        error={errors.name?.message}
        {...register('name', {
          required: 'Name is required',
          maxLength: { value: 120, message: 'Too long' },
        })}
      />
      <div className={styles.grid2}>
        <Input
          label="City"
          error={errors.city?.message}
          {...register('city', { required: 'City is required' })}
        />
        <Input
          label="Pincode (optional)"
          inputMode="numeric"
          error={errors.pincode?.message}
          {...register('pincode', {
            validate: (value) => !value || /^\d{6}$/.test(value) || 'Pincode must be 6 digits',
          })}
        />
      </div>
      <Input
        label="Address"
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />
      <div className={styles.grid2}>
        <Input
          label="Latitude"
          type="number"
          step="any"
          error={errors.latitude?.message}
          {...register('latitude', {
            required: 'Latitude is required',
            min: { value: -90, message: 'Between -90 and 90' },
            max: { value: 90, message: 'Between -90 and 90' },
          })}
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          error={errors.longitude?.message}
          {...register('longitude', {
            required: 'Longitude is required',
            min: { value: -180, message: 'Between -180 and 180' },
            max: { value: 180, message: 'Between -180 and 180' },
          })}
        />
      </div>
      <Input
        label="Amenities"
        hint="Comma separated, for example: Dolby Audio, Parking"
        error={errors.amenities?.message}
        {...register('amenities')}
      />
      {isAdmin && (
        <Select label="Manager" error={errors.manager?.message} {...register('manager')}>
          <option value="">No manager</option>
          {managers.data?.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </Select>
      )}

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isCreating || isUpdating}>
          {isEdit ? 'Save changes' : 'Create theater'}
        </Button>
      </div>
    </form>
  );
}

export default function TheaterFormModal({ open, theater, onClose }) {
  return (
    <Modal open={open} title={theater ? 'Edit theater' : 'Add theater'} onClose={onClose}>
      <TheaterForm theater={theater} onClose={onClose} />
    </Modal>
  );
}
