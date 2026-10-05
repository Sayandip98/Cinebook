import { Link } from 'react-router-dom';
import { Drama, Fingerprint, Ghost, Heart, Laugh, Rocket, Sparkles, Swords } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import { ROUTES } from '@/constants/routes';
import styles from './GenreGrid.module.css';

const GENRES = [
  { name: 'Action', icon: Swords, tint: '#f97316' },
  { name: 'Sci-Fi', icon: Rocket, tint: '#6366f1' },
  { name: 'Horror', icon: Ghost, tint: '#64748b' },
  { name: 'Romance', icon: Heart, tint: '#ec4899' },
  { name: 'Comedy', icon: Laugh, tint: '#eab308' },
  { name: 'Thriller', icon: Fingerprint, tint: '#14b8a6' },
  { name: 'Animation', icon: Sparkles, tint: '#8b5cf6' },
  { name: 'Drama', icon: Drama, tint: '#ef4444' },
];

export default function GenreGrid() {
  return (
    <section className={`container ${styles.section}`}>
      <SectionHeader eyebrow="Curated for you" title="Browse by genre" />
      <div className={styles.grid}>
        {GENRES.map(({ name, icon: Icon, tint }) => (
          <Link
            key={name}
            to={`${ROUTES.MOVIES}?genre=${encodeURIComponent(name)}`}
            className={styles.tile}
            style={{ '--tint': tint }}
          >
            <span className={styles.icon}>
              <Icon size={20} />
            </span>
            <span className={styles.name}>{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
