import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Loader from '@/components/common/Loader';
import { refreshSession } from '@/api/refreshSession';
import {
  loggedOut,
  selectAuthReady,
  setCredentials,
  setInitialized,
} from '@/features/auth/authSlice';
import { selectCity, selectTheme } from '@/features/ui/uiSlice';
import AppRoutes from '@/routes/AppRoutes';
import { STORAGE_KEYS, storage } from '@/utils/storage';
import { hasSessionHint, setSessionHint } from '@/utils/sessionHint';

export default function App() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const city = useSelector(selectCity);
  const isReady = useSelector(selectAuthReady);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.set(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CITY, city);
  }, [city]);

  // Restore the session once, but only if this browser had one.
  useEffect(() => {
    let active = true;

    const restore = async () => {
      if (!hasSessionHint()) {
        dispatch(setInitialized());
        return;
      }
      const session = await refreshSession();
      if (!active) return;
      if (session) {
        dispatch(setCredentials(session));
      } else {
        setSessionHint(false);
        dispatch(loggedOut());
      }
    };

    restore();
    return () => {
      active = false;
    };
  }, [dispatch]);

  if (!isReady) return <Loader fullPage label="Starting CineBook" />;

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
