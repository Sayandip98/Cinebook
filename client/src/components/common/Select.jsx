import { forwardRef, useId } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Input.module.css';

const Select = forwardRef(function Select({ label, error, id, className, children, ...rest }, ref) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cx(styles.input, error && styles.invalid)}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
