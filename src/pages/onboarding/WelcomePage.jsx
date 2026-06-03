import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import styles from './WelcomePage.module.css';

export function WelcomePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  return (
    <div className={styles.page}>
      <div className={styles.decorBg} aria-hidden="true">
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      <div className={styles.content}>
        {/* Ícono central animado */}
        <div className={styles.iconWrap} aria-hidden="true">
          <div className={styles.iconRing}>
            <div className={styles.iconCore}>
              <i className="fa-solid fa-brain" />
            </div>
          </div>
          <div className={styles.floatingBadge}>
            <i className="fa-solid fa-leaf" />
          </div>
        </div>

        <div className={styles.textBlock}>
          <h1 className={styles.title}>Bienvenida, {firstName} 🎉</h1>
          <p className={styles.lead}>
            El sistema educativo tradicional ignora la diversidad cognitiva. Nuestra IA
            diagnosticará tu perfil para adaptar el contenido a tu propio ritmo.
          </p>
          <p className={styles.description}>
            En los próximos 3 minutos responderás 10 preguntas que nos permitirán conocer si eres un
            aprendiz <strong>Visual</strong>, <strong>Auditivo</strong> o{' '}
            <strong>Kinestésico</strong>. Con esa información, construiremos tu ruta de aprendizaje
            personalizada.
          </p>
        </div>

        <div className={styles.features}>
          {[
            { icon: 'fa-brain', label: 'Diagnóstico VAK', desc: '10 preguntas visuales, 3 min' },
            { icon: 'fa-route', label: 'Ruta adaptativa', desc: 'Contenido a tu medida' },
            { icon: 'fa-robot', label: 'Tutor IA', desc: 'Retroalimentación en tiempo real' },
          ].map((f) => (
            <div key={f.label} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.featureLabel}>{f.label}</p>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.ctas}>
          <Button
            variant="primary"
            size="lg"
            icon="fa-arrow-right"
            iconPosition="right"
            onClick={() => navigate(ROUTES.DIAGNOSTIC)}
          >
            Comenzar diagnóstico (toma 3 minutos)
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}>
            Saltar por ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
