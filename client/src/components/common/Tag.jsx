import { cx } from '@/utils/classNames';
import styles from './Tag.module.css';

export default function Tag({ tone = 'neutral', children }) {
  return <span className={cx(styles.tag, styles[tone])}>{children}</span>;
}
