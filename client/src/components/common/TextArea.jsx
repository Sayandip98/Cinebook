import { forwardRef, useId } from 'react';
import { cx } from '@/utils/classNames';
import styles from './Input.module.css';

const TextArea = forwardRef(function TextArea(
  { label, error, id, className, rows = 4, ...rest },
  ref,
) {
  const generatedId = useId();
  const areaId = id ?? generatedId;

  return (
    <div className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={areaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        className={cx(styles.input, error && styles.invalid)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default TextArea;
