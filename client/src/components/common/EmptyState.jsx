import styles from './EmptyState.module.css';

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className={styles.wrap}>
      {Icon && (
        <span className={styles.icon}>
          <Icon size={28} />
        </span>
      )}
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  );
}
