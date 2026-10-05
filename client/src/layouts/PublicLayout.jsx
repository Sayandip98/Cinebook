import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout-parts/Navbar';
import Footer from '@/components/layout-parts/Footer';
import VerifyBanner from '@/components/layout-parts/VerifyBanner';
import styles from './PublicLayout.module.css';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Navbar />
      <VerifyBanner />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
