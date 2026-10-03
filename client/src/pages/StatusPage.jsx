import { useDispatch, useSelector } from 'react-redux';
import { useGetHealthQuery } from '@/features/system/systemApi';
import { selectTheme, toggleTheme } from '@/features/ui/uiSlice';
import styles from './StatusPage.module.css';

export default function StatusPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const { data, isLoading, isError, refetch } = useGetHealthQuery();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>CineBook</h1>
        <p className={styles.subtitle}>Phase 1: system status</p>

        {isLoading && <p>Checking API...</p>}

        {isError && (
          <p className={styles.error}>API unreachable. Is the server running and CORS set?</p>
        )}

        {data && (
          <ul className={styles.list}>
            <li>
              API: <strong className={styles.ok}>{data.status}</strong>
            </li>
            <li>
              Database: <strong className={styles.ok}>{data.database}</strong>
            </li>
            <li>Uptime: {data.uptimeSeconds}s</li>
          </ul>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={refetch}>
            Refresh
          </button>
          <button type="button" className={styles.button} onClick={() => dispatch(toggleTheme())}>
            Theme: {theme}
          </button>
        </div>
      </section>
    </main>
  );
}
