import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import { getErrorDetails } from '@/utils/getErrorMessage';
import { toList } from '@/utils/formHelpers';
import { useCreateScreenMutation } from './dashboardApi';
import styles from './dashboard.module.css';

const SCREEN_TYPES = ['2D', '3D', 'IMAX'];
const COVERAGE_ERROR = 'Categories must cover every row exactly once, with no gaps or overlaps.';

const DEFAULTS = {
  name: '',
  type: '2D',
  rows: 10,
  columns: 12,
  blockedSeats: '',
  categories: [
    { name: 'SILVER', fromRow: 1, toRow: 3, priceMultiplier: 1 },
    { name: 'GOLD', fromRow: 4, toRow: 8, priceMultiplier: 1.3 },
    { name: 'PREMIUM', fromRow: 9, toRow: 10, priceMultiplier: 1.6 },
  ],
};

const coversEveryRow = (rows, categories) => {
  const sorted = [...categories].sort((a, b) => a.fromRow - b.fromRow);
  let expected = 1;
  for (const category of sorted) {
    if (category.fromRow !== expected || category.toRow < category.fromRow) return false;
    expected = category.toRow + 1;
  }
  return expected === rows + 1;
};

function ScreenForm({ theaterId, onClose }) {
  const [createScreen, { isLoading }] = useCreateScreenMutation();
  const [formError, setFormError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULTS });
  const { fields, append, remove } = useFieldArray({ control, name: 'categories' });

  const onSubmit = async (values) => {
    setFormError('');

    const rows = Number(values.rows);
    const categories = values.categories.map((category) => ({
      name: category.name.trim().toUpperCase(),
      fromRow: Number(category.fromRow),
      toRow: Number(category.toRow),
      priceMultiplier: Number(category.priceMultiplier),
    }));

    if (!coversEveryRow(rows, categories)) {
      setFormError(COVERAGE_ERROR);
      return;
    }

    try {
      await createScreen({
        theaterId,
        name: values.name.trim(),
        type: values.type,
        seatLayout: {
          rows,
          columns: Number(values.columns),
          categories,
          blockedSeats: toList(values.blockedSeats.toUpperCase()),
        },
      }).unwrap();
      toast.success('Screen created');
      onClose();
    } catch (error) {
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
        <Input
          label="Screen name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Select label="Type" {...register('type')}>
          {SCREEN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.grid2}>
        <Input
          label="Rows (1-26)"
          type="number"
          error={errors.rows?.message}
          {...register('rows', {
            required: 'Required',
            min: { value: 1, message: 'At least 1' },
            max: { value: 26, message: 'At most 26' },
          })}
        />
        <Input
          label="Seats per row (1-30)"
          type="number"
          error={errors.columns?.message}
          {...register('columns', {
            required: 'Required',
            min: { value: 1, message: 'At least 1' },
            max: { value: 30, message: 'At most 30' },
          })}
        />
      </div>

      <div>
        <h3 className={styles.fieldsetTitle}>Seat categories (by row number)</h3>
        <div className={styles.form}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.categoryRow}>
              <Input label="Name" {...register(`categories.${index}.name`, { required: true })} />
              <Input
                label="From row"
                type="number"
                {...register(`categories.${index}.fromRow`, { required: true, min: 1 })}
              />
              <Input
                label="To row"
                type="number"
                {...register(`categories.${index}.toRow`, { required: true, min: 1 })}
              />
              <Input
                label="Price x"
                type="number"
                step="0.05"
                {...register(`categories.${index}.priceMultiplier`, { required: true, min: 0.1 })}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove category"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => append({ name: '', fromRow: '', toRow: '', priceMultiplier: 1 })}
            >
              <Plus size={14} /> Add category
            </Button>
          </div>
        </div>
      </div>

      <Input
        label="Blocked seats (optional)"
        hint="Comma separated, for example: A1, A12"
        {...register('blockedSeats')}
      />

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          Create screen
        </Button>
      </div>
    </form>
  );
}

export default function ScreenFormModal({ open, theaterId, onClose }) {
  return (
    <Modal open={open} title="Add screen" onClose={onClose}>
      <ScreenForm theaterId={theaterId} onClose={onClose} />
    </Modal>
  );
}
