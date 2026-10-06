import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export default function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
