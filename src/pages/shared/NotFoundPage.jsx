import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.desc}>
          La página que buscas no existe o fue movida. Vuelve al inicio y continúa aprendiendo.
        </p>
        <Button variant="primary" icon="fa-house" onClick={() => navigate('/student/dashboard')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
