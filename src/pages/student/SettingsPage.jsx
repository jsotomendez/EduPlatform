import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { THEMES, FONT_SIZES } from '../../constants/config';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { ROUTES } from '../../constants/routes';
import styles from './SettingsPage.module.css';

const THEME_OPTIONS = [
  { value: THEMES.LIGHT, icon: 'fa-sun', label: 'Claro' },
  { value: THEMES.DARK, icon: 'fa-moon', label: 'Oscuro' },
  { value: THEMES.DYSLEXIA, icon: 'fa-font', label: 'Dislexia' },
  { value: THEMES.HIGH_CONTRAST, icon: 'fa-circle-half-stroke', label: 'Alto contraste' },
];

const FONT_OPTIONS = [
  { value: FONT_SIZES.SMALL, label: 'Pequeño', sample: '14px' },
  { value: FONT_SIZES.NORMAL, label: 'Normal', sample: '16px' },
  { value: FONT_SIZES.LARGE, label: 'Grande', sample: '18px' },
  { value: FONT_SIZES.XLARGE, label: 'Muy grande', sample: '20px' },
];

export function SettingsPage() {
  const { user } = useUser();
  const { theme, fontSize, reducedMotion, setTheme, setFontSize, toggleReducedMotion } = useTheme();
  const navigate = useNavigate();
  const profile = user?.cognitiveProfile;
  const styleInfo = profile ? LEARNING_STYLES[profile.primary] : null;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>Personaliza tu experiencia de aprendizaje</p>
      </header>

      {/* Perfil */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-user" aria-hidden="true" /> Perfil
        </h2>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            <span>{user?.name?.charAt(0)}</span>
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user?.name}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
            <p className={styles.profileUniversity}>
              {user?.university} · Semestre {user?.semester}
            </p>
          </div>
        </div>
      </Card>

      {/* Estilo de aprendizaje */}
      {profile && (
        <Card padding="md">
          <h2 className={styles.sectionTitle}>
            <i className="fa-solid fa-brain" aria-hidden="true" /> Perfil cognitivo
          </h2>
          <div className={styles.vakProfile}>
            <div
              className={styles.vakMain}
              style={{ background: styleInfo.bg, borderColor: styleInfo.color + '30' }}
            >
              <i
                className={`fa-solid ${styleInfo.icon}`}
                style={{ color: styleInfo.color, fontSize: 'var(--fs-2xl)' }}
                aria-hidden="true"
              />
              <div>
                <p className={styles.vakLabel}>Tu estilo dominante</p>
                <p className={styles.vakValue} style={{ color: styleInfo.color }}>
                  {styleInfo.label}
                </p>
              </div>
              <div className={styles.vakScores}>
                {Object.entries(profile.scores).map(([style, score]) => {
                  const percentage = (score / 10) * 100;
                  return (
                    <div key={style} className={styles.scoreItem}>
                      <div className={styles.scoreHeader}>
                        <span className={styles.scoreLabel}>{LEARNING_STYLES[style]?.label}</span>
                        <span className={styles.scoreVal}>{score}/10</span>
                      </div>
                      <div className={styles.scoreBarOuter}>
                        <div
                          className={`${styles.scoreBarInner} ${styles[style]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              variant="ghost"
              icon="fa-rotate-right"
              size="sm"
              onClick={() => navigate(ROUTES.DIAGNOSTIC)}
            >
              Repetir diagnóstico
            </Button>
          </div>
        </Card>
      )}

      {/* Accesibilidad */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-universal-access" aria-hidden="true" /> Accesibilidad
        </h2>

        <div className={styles.settingGroup}>
          <h3 className={styles.groupTitle}>Tema visual</h3>
          <div className={styles.themeOptions}>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                className={[styles.themeOption, theme === t.value ? styles.themeSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setTheme(t.value)}
                aria-pressed={theme === t.value}
              >
                <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <h3 className={styles.groupTitle}>Tamaño de fuente</h3>
          <div className={styles.fontOptions}>
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                className={[styles.fontOption, fontSize === f.value ? styles.fontSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFontSize(f.value)}
                aria-pressed={fontSize === f.value}
              >
                <span style={{ fontSize: f.sample }}>A</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleLabel}>Reducir movimiento</p>
            <p className={styles.toggleDesc}>
              Desactiva animaciones y transiciones para mayor comodidad
            </p>
          </div>
          <button
            className={[styles.toggle, reducedMotion ? styles.toggleOn : '']
              .filter(Boolean)
              .join(' ')}
            onClick={toggleReducedMotion}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Reducir movimiento"
          >
            <div className={styles.toggleThumb} />
          </button>
        </div>
      </Card>

      {/* Suscripción */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-crown" aria-hidden="true" /> Suscripción
        </h2>
        <div className={styles.planCard}>
          <div className={styles.planInfo}>
            <Badge variant="success" icon="fa-check" size="md">
              Plan Freemium activo
            </Badge>
            <p className={styles.planDesc}>
              Acceso a cursos básicos, diagnóstico VAK y tutor IA limitado.
            </p>
          </div>
          <Button variant="primary" icon="fa-arrow-up" size="sm" disabled>
            Actualizar a Premium (Próximamente)
          </Button>
        </div>
      </Card>
    </div>
  );
}
