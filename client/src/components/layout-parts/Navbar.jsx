import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, Ticket, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/features/auth/authApi';
import { ROUTES } from '@/constants/routes';
import { ROLES, STAFF_ROLES } from '@/constants/roles';
import { cx } from '@/utils/classNames';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import CitySelect from './CitySelect';
import styles from './Navbar.module.css';

const linkClass = ({ isActive }) => cx(styles.link, isActive && styles.active);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [logout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [term, setTerm] = useState('');
  const userMenuRef = useRef(null);

  const isStaff = STAFF_ROLES.includes(user?.role);
  const dashboardPath = user?.role === ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.MANAGE;

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = term.trim();
    closeMenus();
    navigate(query ? `${ROUTES.MOVIES}?search=${encodeURIComponent(query)}` : ROUTES.MOVIES);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    toast.success('Signed out');
    navigate(ROUTES.HOME);
  };

  const searchForm = (
    <form className={styles.search} onSubmit={handleSearch} role="search">
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search movies"
        aria-label="Search movies"
        maxLength={100}
      />
    </form>
  );

  return (
    <header className={styles.header}>
      <div className={cx('container', styles.bar)}>
        <Logo />
        <div className={styles.city}>
          <CitySelect />
        </div>
        <nav className={styles.links} aria-label="Primary">
          <NavLink to={ROUTES.MOVIES} className={linkClass}>
            Movies
          </NavLink>
          <NavLink to={ROUTES.THEATERS} className={linkClass}>
            Theaters
          </NavLink>
        </nav>
        <div className={styles.searchDesktop}>{searchForm}</div>

        <div className={styles.actions}>
          <ThemeToggle />

          {isAuthenticated ? (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userButton}
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatarFallback}>{user.name.charAt(0).toUpperCase()}</span>
                )}
                <ChevronDown size={16} aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown} role="menu">
                  <p className={styles.userName}>{user.name}</p>
                  <Link to={ROUTES.BOOKINGS} className={styles.menuItem} onClick={closeMenus}>
                    <Ticket size={16} /> My bookings
                  </Link>
                  <Link to={ROUTES.PROFILE} className={styles.menuItem} onClick={closeMenus}>
                    <User size={16} /> Profile
                  </Link>
                  {isStaff && (
                    <Link to={dashboardPath} className={styles.menuItem} onClick={closeMenus}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}
                  <button type="button" className={styles.menuItem} onClick={handleLogout}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.guestActions}>
              <Button to={ROUTES.LOGIN} size="sm">
                Sign in
              </Button>
            </div>
          )}

          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobilePanel}>
          <div className="container">
            {searchForm}
            <div className={styles.mobileCity}>
              <CitySelect />
            </div>
            <nav className={styles.mobileLinks} aria-label="Mobile">
              <NavLink to={ROUTES.MOVIES} className={linkClass} onClick={closeMenus}>
                Movies
              </NavLink>
              <NavLink to={ROUTES.THEATERS} className={linkClass} onClick={closeMenus}>
                Theaters
              </NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to={ROUTES.BOOKINGS} className={linkClass} onClick={closeMenus}>
                    My bookings
                  </NavLink>
                  <NavLink to={ROUTES.PROFILE} className={linkClass} onClick={closeMenus}>
                    Profile
                  </NavLink>
                  {isStaff && (
                    <NavLink to={dashboardPath} className={linkClass} onClick={closeMenus}>
                      Dashboard
                    </NavLink>
                  )}
                  <button type="button" className={styles.mobileLogout} onClick={handleLogout}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to={ROUTES.LOGIN} className={linkClass} onClick={closeMenus}>
                    Sign in
                  </NavLink>
                  <NavLink to={ROUTES.REGISTER} className={linkClass} onClick={closeMenus}>
                    Create account
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
