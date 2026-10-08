import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import { applyFieldErrors, getErrorDetails } from '@/utils/getErrorMessage';
import { isoToIstInput, istInputToIso, nowIstInput } from '@/utils/dateInput';
import { useCreateCouponMutation, useUpdateCouponMutation } from './couponsApi';
import styles from '@/features/dashboard/dashboard.module.css';

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

const buildDefaults = (coupon) =>
  coupon
    ? {
        description: coupon.description ?? '',
        value: coupon.value,
        maxDiscount: coupon.maxDiscount ?? '',
        minOrderAmount: coupon.minOrderAmount,
        validFrom: isoToIstInput(coupon.validFrom),
        validTo: isoToIstInput(coupon.validTo),
        usageLimit: coupon.usageLimit ?? '',
        perUserLimit: coupon.perUserLimit,
      }
    : {
        code: '',
        description: '',
        type: 'PERCENT',
        value: '',
        maxDiscount: '',
        minOrderAmount: 0,
        validFrom: nowIstInput(),
        validTo: '',
        usageLimit: '',
        perUserLimit: 1,
      };

const optionalNumber = (value) => (value === '' ? undefined : Number(value));

function CouponForm({ coupon, onClose }) {
  const isEdit = Boolean(coupon);
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: buildDefaults(coupon) });

  const type = isEdit ? coupon.type : watch('type');
  const isPercent = type === 'PERCENT';

  const onSubmit = async (values) => {
    setFormError('');

    const shared = {
      value: Number(values.value),
      minOrderAmount: Number(values.minOrderAmount),
      validFrom: istInputToIso(values.validFrom),
      validTo: istInputToIso(values.validTo),
      perUserLimit: Number(values.perUserLimit),
    };

    try {
      if (isEdit) {
        await updateCoupon({
          id: coupon.id,
          ...shared,
          description: values.description.trim(),
          // null clears a limit; undefined leaves it untouched (not sent).
          usageLimit: optionalNumber(values.usageLimit) ?? null,
          ...(isPercent ? { maxDiscount: optionalNumber(values.maxDiscount) ?? null } : {}),
        }).unwrap();
        toast.success('Coupon updated');
      } else {
        const body = { ...shared, code: values.code.trim().toUpperCase(), type: values.type };
        if (values.description.trim()) body.description = values.description.trim();
        if (isPercent && values.maxDiscount !== '') body.maxDiscount = Number(values.maxDiscount);
        if (values.usageLimit !== '') body.usageLimit = Number(values.usageLimit);
        await createCoupon(body).unwrap();
        toast.success('Coupon created');
      }
      onClose();
    } catch (error) {
      applyFieldErrors(error, setError);
      setFormError(getErrorDetails(error));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <p className={styles.alert} role="alert">
          {formError}
        </p>
      )}

      <div className={styles.grid2}>
        {isEdit ? (
          <Input label="Code" value={coupon.code} readOnly disabled />
        ) : (
          <Input
            label="Code"
            error={errors.code?.message}
            {...register('code', {
              required: 'Code is required',
              pattern: { value: CODE_PATTERN, message: '3-20 letters, digits, _ or -' },
            })}
          />
        )}
        {isEdit ? (
          <Input label="Type" value={coupon.type} readOnly disabled />
        ) : (
          <Select label="Type" {...register('type')}>
            <option value="PERCENT">Percentage</option>
            <option value="FLAT">Flat amount</option>
          </Select>
        )}
      </div>

      <Input
        label="Description (optional)"
        error={errors.description?.message}
        {...register('description', {
          maxLength: { value: 200, message: 'At most 200 characters' },
        })}
      />

      <div className={styles.grid2}>
        <Input
          label={isPercent ? 'Discount (%)' : 'Discount (Rs)'}
          type="number"
          step="any"
          error={errors.value?.message}
          {...register('value', {
            required: 'Enter a value',
            min: { value: 1, message: 'At least 1' },
            max: isPercent
              ? { value: 100, message: 'At most 100' }
              : { value: 100000, message: 'Too large' },
          })}
        />
        {isPercent && (
          <Input
            label="Max discount (Rs, optional)"
            type="number"
            min="0"
            error={errors.maxDiscount?.message}
            {...register('maxDiscount')}
          />
        )}
      </div>

      <div className={styles.grid2}>
        <Input
          label="Minimum order (Rs)"
          type="number"
          min="0"
          error={errors.minOrderAmount?.message}
          {...register('minOrderAmount', { required: 'Enter 0 for no minimum' })}
        />
        <Input
          label="Uses per user"
          type="number"
          min="1"
          error={errors.perUserLimit?.message}
          {...register('perUserLimit', {
            required: 'Required',
            min: { value: 1, message: 'At least 1' },
          })}
        />
      </div>

      <div className={styles.grid2}>
        <Input
          label="Valid from (IST)"
          type="datetime-local"
          error={errors.validFrom?.message}
          {...register('validFrom', { required: 'Required' })}
        />
        <Input
          label="Valid until (IST)"
          type="datetime-local"
          error={errors.validTo?.message}
          {...register('validTo', { required: 'Required' })}
        />
      </div>

      <Input
        label="Total uses (optional)"
        type="number"
        min="1"
        hint="Leave empty for unlimited."
        error={errors.usageLimit?.message}
        {...register('usageLimit')}
      />

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isCreating || isUpdating}>
          {isEdit ? 'Save changes' : 'Create coupon'}
        </Button>
      </div>
    </form>
  );
}

export default function CouponFormModal({ open, coupon, onClose }) {
  return (
    <Modal open={open} title={coupon ? 'Edit coupon' : 'Add coupon'} onClose={onClose}>
      <CouponForm coupon={coupon} onClose={onClose} />
    </Modal>
  );
}
