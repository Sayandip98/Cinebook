import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/features/notifications/notificationsApi';
import { ROUTES } from '@/constants/routes';
import styles from './NotificationBell.module.css';

const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const { data: count = 0 } = useGetUnreadCountQuery(undefined, {
    pollingInterval: POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });

  return (
    <Link
      to={ROUTES.NOTIFICATIONS}
      className={styles.bell}
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
    >
      <Bell size={18} />
      {count > 0 && <span className={styles.badge}>{count > 9 ? '9+' : count}</span>}
    </Link>
  );
}
