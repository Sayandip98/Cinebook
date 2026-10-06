import { cx } from '@/utils/classNames';
import { formatCurrency, formatReleaseDate } from '@/utils/format';
import styles from './charts.module.css';

const toDay = (dateKey) => formatReleaseDate(`${dateKey}T00:00:00+05:30`);

export default function RevenueChart({ series }) {
  const highest = Math.max(...series.map((day) => day.revenue), 1);
  const total = series.reduce((sum, day) => sum + day.revenue, 0);

  return (
    <div>
      <div
        className={styles.chart}
        role="img"
        aria-label={`Revenue over the last ${series.length} days, ${formatCurrency(total)} in total`}
      >
        {series.map((day) => (
          <div
            key={day.date}
            className={styles.col}
            title={`${toDay(day.date)}: ${formatCurrency(day.revenue)}, ${day.bookings} bookings`}
          >
            <span
              className={cx(styles.bar, day.revenue === 0 && styles.zero)}
              style={{ height: `${Math.max(2, (day.revenue / highest) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className={styles.axis}>
        <span>{toDay(series[0].date)}</span>
        <span>{toDay(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
}
