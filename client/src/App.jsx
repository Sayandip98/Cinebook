import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { selectTheme } from '@/features/ui/uiSlice';
import StatusPage from '@/pages/StatusPage';

export default function App() {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<StatusPage />} />
    </Routes>
  );
}
