import { Outlet } from 'react-router-dom';
import { Armchair, ShieldCheck, Zap } from 'lucide-react';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import styles from './AuthLayout.module.css';

const PERKS = [
  { icon: Armchair, text: 'Choose your exact seats on a live map' },
  { icon: Zap, text: 'Book in under a minute' },
  { icon: ShieldCheck, text: 'Secure payments, instant e-tickets' },
];

export default function AuthLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.brandPanel}>
        <Logo />
        <div>
          <h2 className={styles.headline}>Pick your seat. Own the night.</h2>
          <ul className={styles.perks}>
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} /> {text}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.note}>CineBook · portfolio project</p>
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.topbar}>
          <div className={styles.mobileLogo}>
            <Logo />
          </div>
          <ThemeToggle />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
