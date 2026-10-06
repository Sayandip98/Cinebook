import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import styles from './Pagination.module.css';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </Button>
      <span className={styles.status}>
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight size={16} />
      </Button>
    </nav>
  );
}
