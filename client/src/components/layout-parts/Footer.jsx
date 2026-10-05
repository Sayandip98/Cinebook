import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>Pick your seat. Own the night.</p>
          <p className={styles.about}>
            Book movie tickets in a few taps, with live seat maps and secure payments.
          </p>
        </div>

        <nav aria-label="Movies">
          <h3 className={styles.heading}>Movies</h3>
          <Link to={`${ROUTES.MOVIES}?status=NOW_SHOWING`}>Now showing</Link>
          <Link to={`${ROUTES.MOVIES}?status=UPCOMING`}>Coming soon</Link>
          <Link to={ROUTES.MOVIES}>All movies</Link>
        </nav>

        <nav aria-label="Theaters">
          <h3 className={styles.heading}>Theaters</h3>
          <Link to={ROUTES.THEATERS}>Find a theater</Link>
        </nav>

        <nav aria-label="Account">
          <h3 className={styles.heading}>Account</h3>
          <Link to={ROUTES.LOGIN}>Sign in</Link>
          <Link to={ROUTES.REGISTER}>Create account</Link>
          <Link to={ROUTES.BOOKINGS}>My bookings</Link>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} CineBook. A portfolio project.</p>
      </div>
    </footer>
  );
}
