import { formatCurrency } from '@/utils/format';
import styles from './charts.module.css';

export default function RankedList({ title, items }) {
  const highest = Math.max(...items.map((item) => item.revenue), 1);

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {items.length === 0 ? (
        <p className={styles.empty}>No confirmed bookings yet.</p>
      ) : (
        <ul className={styles.ranked}>
          {items.map((item) => (
            <li key={item.id}>
              <div className={styles.rankTop}>
                <span>{item.label}</span>
                <strong>{formatCurrency(item.revenue)}</strong>
              </div>
              <div className={styles.track}>
                <span
                  className={styles.fill}
                  style={{ width: `${(item.revenue / highest) * 100}%` }}
                />
              </div>
              <span className={styles.statHint}>{item.tickets} tickets</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
