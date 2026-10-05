import { cx } from '@/utils/classNames';
import styles from './Loader.module.css';

export default function Loader({ fullPage = false, label = 'Loading' }) {
  return (
    <div className={cx(styles.wrap, fullPage && styles.full)} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
