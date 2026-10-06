import { Search } from 'lucide-react';
import styles from './SearchField.module.css';

export default function SearchField({ value = '', onSubmit, placeholder = 'Search' }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(String(new FormData(event.currentTarget).get('q') ?? '').trim());
  };

  return (
    <form key={value} className={styles.form} onSubmit={handleSubmit} role="search">
      <Search size={16} aria-hidden="true" />
      <input
        name="q"
        type="search"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
      />
    </form>
  );
}
