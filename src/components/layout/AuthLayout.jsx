import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../feedback/Toast';
import { useNotifications } from '../../context/NotificationContext';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className={styles.layout}>
      {/* Panel izquierdo — ilustración + mensaje */}
      <div className={styles.illustrationPanel} aria-hidden="true">
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
        <div className={styles.illustrationContent}>
          <div className={styles.logoMark}>
            <i className="fa-solid fa-brain" />
          </div>
          <h1 className={styles.tagline}>
            Aprende a tu ritmo.
            <br />
            Aprende contigo.
          </h1>
          <p className={styles.taglineSub}>
            Diagnóstico cognitivo · Rutas adaptativas · IA que te acompaña
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>VAK</span>
              <span className={styles.statLabel}>Diagnóstico cognitivo</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>IA</span>
              <span className={styles.statLabel}>Tutor personalizado</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>MEN</span>
              <span className={styles.statLabel}>Currículo colombiano</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <main className={styles.formPanel}>
        <div className={styles.formContent}>
          <Outlet />
        </div>
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
