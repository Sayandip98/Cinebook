import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import styles from './Logo.module.css';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className={styles.logo} aria-label="CineBook home">
      <span className={styles.mark}>
        <Ticket size={18} />
      </span>
      <span className={styles.text}>CineBook</span>
    </Link>
  );
}
