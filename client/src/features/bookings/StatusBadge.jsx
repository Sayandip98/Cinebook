import { cx } from '@/utils/classNames';
import styles from './StatusBadge.module.css';

const CONFIG = {
  PENDING: { label: 'Awaiting payment', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

export default function StatusBadge({ status }) {
  const { label, tone } = CONFIG[status] ?? { label: status, tone: 'neutral' };
  return <span className={cx(styles.badge, styles[tone])}>{label}</span>;
}
