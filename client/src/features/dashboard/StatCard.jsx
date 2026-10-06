import { Link } from 'react-router-dom';
import { cx } from '@/utils/classNames';
import styles from './charts.module.css';

export default function StatCard({ icon: Icon, label, value, hint, warn = false, to }) {
  const content = (
    <>
      <span className={cx(styles.statIcon, warn && styles.statWarn)}>
        <Icon size={20} />
      </span>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
        {hint && <p className={styles.statHint}>{hint}</p>}
      </div>
    </>
  );

  return to ? (
    <Link to={to} className={styles.stat}>
      {content}
    </Link>
  ) : (
    <div className={styles.stat}>{content}</div>
  );
}
