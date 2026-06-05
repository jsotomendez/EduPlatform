import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import styles from './Toast.module.css';

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

export function Toast({ id, type = 'info', message, onClose }) {
  const { reducedMotion } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const toastVariants = {
    hidden: { 
      opacity: 0, 
      x: reducedMotion ? 0 : 50,
      scale: reducedMotion ? 1 : 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: reducedMotion 
        ? { duration: 0.15 } 
        : { type: 'spring', stiffness: 350, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      x: reducedMotion ? 0 : 50,
      scale: reducedMotion ? 1 : 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className={[styles.toast, styles[type]].join(' ')}
      role="alert"
      aria-live="assertive"
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <i className={`fa-solid ${ICONS[type]}`} aria-hidden="true" />
      <span>{message}</span>
      <button className={styles.close} onClick={() => onClose(id)} aria-label="Cerrar notificación">
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className={styles.container} aria-label="Notificaciones">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

