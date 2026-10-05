import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { selectTheme, toggleTheme } from '@/features/ui/uiSlice';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
