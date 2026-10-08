import { NavLink, Outlet } from 'react-router-dom';
import {
  Building2,
  CalendarClock,
  Clapperboard,
  LayoutDashboard,
  RotateCcw,
  ScanLine,
  Ticket,
  Users,
  TicketPercent,
} from 'lucide-react';
import Navbar from '@/components/layout-parts/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { cx } from '@/utils/classNames';
import styles from './DashboardLayout.module.css';

const STAFF_LINKS = [
  { to: '/manage', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/manage/bookings', label: 'Bookings', icon: Ticket },
  { to: '/manage/shows', label: 'Shows', icon: CalendarClock },
  { to: '/manage/theaters', label: 'Theaters', icon: Building2 },
  { to: '/manage/check-in', label: 'Check-in', icon: ScanLine },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
];

const ADMIN_LINKS = [
  { to: '/admin/movies', label: 'Movies', icon: Clapperboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
];

const linkClass = ({ isActive }) => cx(styles.link, isActive && styles.active);

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink to={to} end={end} className={linkClass}>
      <Icon size={17} aria-hidden="true" /> {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

  return (
    <>
      <Navbar />
      <div className={cx('container', styles.shell)}>
        <nav className={styles.sidebar} aria-label="Dashboard">
          {STAFF_LINKS.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
          {isAdmin && (
            <>
              <p className={styles.section}>Admin</p>
              {ADMIN_LINKS.map((link) => (
                <SidebarLink key={link.to} {...link} />
              ))}
            </>
          )}
        </nav>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
