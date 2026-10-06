import { useRef } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { cx } from '@/utils/classNames';
import { useRemoveAvatarMutation, useUpdateAvatarMutation } from '@/features/users/usersApi';
import styles from './profile.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

export default function AvatarUploader() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [upload, { isLoading: isUploading }] = useUpdateAvatarMutation();
  const [remove, { isLoading: isRemoving }] = useRemoveAvatarMutation();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Use a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('The image must be 2 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await upload(formData).unwrap();
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemove = async () => {
    try {
      await remove().unwrap();
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Profile photo</h2>
      <div className={styles.avatarRow}>
        {user.avatar?.url ? (
          <img src={user.avatar.url} alt="Your profile" className={styles.avatar} />
        ) : (
          <span className={cx(styles.avatar, styles.avatarFallback)} aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <div className={styles.actions}>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className={styles.hidden}
              onChange={handleFile}
              aria-label="Choose a profile photo"
            />
            <Button
              variant="secondary"
              size="sm"
              loading={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              Upload photo
            </Button>
            {user.avatar?.url && (
              <Button variant="ghost" size="sm" loading={isRemoving} onClick={handleRemove}>
                Remove
              </Button>
            )}
          </div>
          <p className={styles.muted}>JPG, PNG or WebP, up to 2 MB.</p>
        </div>
      </div>
    </section>
  );
}
