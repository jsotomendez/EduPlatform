import { useEffect } from 'react';
import styles from './Toast.module.css';

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

export function Toast({ id, type = 'info', message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={[styles.toast, styles[type]].join(' ')} role="alert" aria-live="assertive">
      <i className={`fa-solid ${ICONS[type]}`} aria-hidden="true" />
      <span>{message}</span>
      <button className={styles.close} onClick={() => onClose(id)} aria-label="Cerrar notificación">
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className={styles.container} aria-label="Notificaciones">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
}
