import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './SectionHeader.module.css';

export default function SectionHeader({ eyebrow, title, actionLabel, actionTo }) {
  return (
    <div className={styles.header}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {actionTo && (
        <Link to={actionTo} className={styles.action}>
          {actionLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
