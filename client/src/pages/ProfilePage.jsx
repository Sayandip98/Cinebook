import AvatarUploader from '@/features/profile/AvatarUploader';
import ChangePasswordForm from '@/features/profile/ChangePasswordForm';
import ProfileForm from '@/features/profile/ProfileForm';
import { cx } from '@/utils/classNames';
import page from './page.module.css';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  return (
    <div className={cx('container', page.page)}>
      <header className={page.header}>
        <h1 className={page.title}>Your profile</h1>
        <p className={page.subtitle}>Manage your details and security.</p>
      </header>
      <div className={styles.stack}>
        <AvatarUploader />
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
