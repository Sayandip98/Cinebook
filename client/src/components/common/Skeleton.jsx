import { cx } from '@/utils/classNames';
import styles from './Skeleton.module.css';

export default function Skeleton({ className, style }) {
  return <div className={cx(styles.skeleton, className)} style={style} aria-hidden="true" />;
}
