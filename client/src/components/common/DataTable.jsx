import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { cx } from '@/utils/classNames';
import styles from './DataTable.module.css';

export default function DataTable({
  columns,
  rows = [],
  isLoading = false,
  isFetching = false,
  emptyIcon,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
}) {
  if (isLoading) {
    return (
      <div className={styles.skeletons}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} style={{ height: '3rem' }} />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className={cx(styles.wrap, isFetching && styles.busy)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
