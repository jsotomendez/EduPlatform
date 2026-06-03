import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { courseService } from '../../services/course.service';
import { SkeletonCard } from '../../components/feedback/Skeleton';
import { formatPercent } from '../../utils/formatters';
import { courseDetailPath } from '../../constants/routes';
import styles from './CoursesPage.module.css';

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'recommended', label: 'Recomendados IA' },
  { value: 'completed', label: 'Completados' },
];

const STATUS_BADGE = {
  in_progress: { label: 'En curso', variant: 'primary' },
  recommended: { label: 'Recomendado por IA', variant: 'info', icon: 'fa-wand-magic-sparkles' },
  completed: { label: 'Completado', variant: 'success', icon: 'fa-circle-check' },
  locked: { label: 'Bloqueado', variant: 'default', icon: 'fa-lock' },
};

export function CoursesPage() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    courseService
      .getCourses()
      .then((data) => setCourses(data))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'all' ? courses : courses.filter((c) => c.status === filter);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Rutas de Aprendizaje</h1>
          <p className={styles.subtitle}>Contenido adaptado a tu perfil cognitivo</p>
        </div>
        <Badge variant="success" icon="fa-wand-magic-sparkles" size="md">
          Adaptadas por IA
        </Badge>
      </header>

      {/* Filtros */}
      <div className={styles.filters} role="tablist" aria-label="Filtrar cursos">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            className={[styles.filter, filter === f.value ? styles.filterActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de cursos */}
      <div className={styles.grid}>
        {isLoading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No hay cursos en esta categoría.</p>
        ) : (
          filtered.map((course) => {
            const status = STATUS_BADGE[course.status] || STATUS_BADGE.locked;
            return (
              <Card
                key={course.id}
                hoverable
                onClick={() => navigate(courseDetailPath(course.id))}
                padding="md"
                className={styles.courseCard}
              >
                <div className={styles.cardTop}>
                  <div
                    className={styles.icon}
                    style={{ background: course.color + '20', color: course.color }}
                  >
                    <i className={`fa-solid ${course.icon}`} aria-hidden="true" />
                  </div>
                  <Badge variant={status.variant} icon={status.icon} size="sm">
                    {status.label}
                  </Badge>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDesc}>{course.description}</p>
                  <div className={styles.meta}>
                    <span className={styles.instructor}>
                      <i className="fa-solid fa-user" aria-hidden="true" />{' '}
                      {course.instructor.split(' ').slice(-2).join(' ')}
                    </span>
                    <span className={styles.enrolled}>
                      <i className="fa-solid fa-users" aria-hidden="true" /> {course.enrolled}
                    </span>
                    <span className={styles.rating}>
                      <i className="fa-solid fa-star" aria-hidden="true" /> {course.rating}
                    </span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <ProgressBar value={Math.round(course.progress * 100)} size="sm" />
                  <span className={styles.progressText}>
                    {formatPercent(course.progress)} completado
                  </span>
                </div>
                {course.status === 'locked' && (
                  <div className={styles.lockOverlay} aria-hidden="true">
                    <i className="fa-solid fa-lock" /> Completa cursos anteriores
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
