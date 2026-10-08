import { Star } from 'lucide-react';
import { cx } from '@/utils/classNames';
import styles from './Stars.module.css';

const VALUES = [1, 2, 3, 4, 5];

export function StarDisplay({ value, size = 16 }) {
  const rounded = Math.round(value);

  return (
    <span className={styles.row} role="img" aria-label={`${value} out of 5 stars`}>
      {VALUES.map((number) => (
        <Star
          key={number}
          size={size}
          className={number <= rounded ? styles.on : styles.off}
          fill={number <= rounded ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, disabled = false }) {
  return (
    <div className={styles.row} role="radiogroup" aria-label="Your rating">
      {VALUES.map((number) => (
        <button
          key={number}
          type="button"
          role="radio"
          aria-checked={value === number}
          aria-label={`${number} star${number > 1 ? 's' : ''}`}
          className={cx(styles.button, number <= value && styles.on)}
          onClick={() => onChange(number)}
          disabled={disabled}
        >
          <Star size={26} fill={number <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
