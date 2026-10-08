import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import FilterSelect from '@/components/common/FilterSelect';
import Pagination from '@/components/common/Pagination';
import Skeleton from '@/components/common/Skeleton';
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/features/notifications/notificationsApi';
import { useQueryState } from '@/hooks/useQueryState';
import { cx } from '@/utils/classNames';
import { formatShowDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import page from './page.module.css';
import styles from './NotificationsPage.module.css';

const PAGE_SIZE = 10;
const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread only' },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { params, setParam, page: currentPage } = useQueryState();
  const unreadOnly = params.get('filter') === 'unread';

  const { data, isLoading, isFetching, isError } = useGetNotificationsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    unread: unreadOnly || undefined,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [remove] = useDeleteNotificationMutation();

  const handleOpen = async (notification) => {
    if (!notification.isRead) {
      try {
        await markRead(notification.id).unwrap();
      } catch {
        /* opening the link matters more than the read flag */
      }
    }
    if (notification.link) navigate(notification.link);
  };

  const handleDelete = async (id) => {
    try {
      await remove(id).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  let content;
  if (isLoading) {
    content = (
      <ul className={page.list}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} style={{ height: '4.5rem' }} />
        ))}
      </ul>
    );
  } else if (isError) {
    content = (
      <EmptyState
        icon={Bell}
        title="Could not load notifications"
        message="Please try again shortly."
      />
    );
  } else if (data.notifications.length === 0) {
    content = (
      <EmptyState
        icon={Bell}
        title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
        message="Booking updates and show reminders will appear here."
      />
    );
  } else {
    content = (
      <>
        <ul className={cx(page.list, isFetching && page.busy)}>
          {data.notifications.map((notification) => (
            <li
              key={notification.id}
              className={cx(styles.item, !notification.isRead && styles.unread)}
            >
              <button
                type="button"
                className={styles.content}
                onClick={() => handleOpen(notification)}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.text}>
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>{formatShowDateTime(notification.createdAt)}</small>
                </span>
                {!notification.isRead && <span className="sr-only">Unread</span>}
              </button>
              <button
                type="button"
                className={styles.remove}
                onClick={() => handleDelete(notification.id)}
                aria-label="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        <Pagination meta={data.meta} onPageChange={(value) => setParam('page', String(value))} />
      </>
    );
  }

  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Notifications</h1>
        <p className={page.subtitle}>
          {data ? `${data.unreadCount} unread` : 'Your latest updates'}
        </p>
      </header>

      <div className={page.toolbar}>
        <FilterSelect
          label="Show"
          value={unreadOnly ? 'unread' : ''}
          options={FILTER_OPTIONS}
          onChange={(value) => setParam('filter', value)}
        />
        {data?.unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={isMarkingAll} onClick={handleMarkAll}>
            <CheckCheck size={16} /> Mark all as read
          </Button>
        )}
      </div>

      {content}
    </div>
  );
}
