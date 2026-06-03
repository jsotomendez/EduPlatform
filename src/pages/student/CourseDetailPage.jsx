import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { useUser } from '../../context/UserContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Skeleton } from '../../components/feedback/Skeleton';
import { LESSON_TYPES } from '../../constants/config';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { formatDuration, formatPercent } from '../../utils/formatters';
import { lessonPath } from '../../constants/routes';
import styles from './CourseDetailPage.module.css';

const TYPE_ICONS = {
  video: 'fa-play',
  audio: 'fa-podcast',
  reading: 'fa-book-open',
  interactive: 'fa-hand-pointer',
};
const TYPE_LABELS = {
  video: 'Video',
  audio: 'Audio',
  reading: 'Lectura',
  interactive: 'Interactivo',
};

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModule, setOpenModule] = useState(null);

  const profile = user?.cognitiveProfile;
  const styleInfo = profile ? LEARNING_STYLES[profile.primary] : null;

  useEffect(() => {
    setIsLoading(true);
    Promise.all([courseService.getCourseById(id), courseService.getLessonsByCourse(id)])
      .then(([c, ls]) => {
        setCourse(c);
        setLessons(ls);
        setOpenModule(c.modules[0]?.id);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height="200px" borderRadius="xl" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-6)',
          }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="60px" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) return <p>Curso no encontrado.</p>;

  const firstLesson = lessons[0];

  return (
    <div className={styles.page}>
      {/* Header del curso */}
      <div
        className={styles.courseHeader}
        style={{
          background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)`,
          borderColor: course.color + '30',
        }}
      >
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver
        </button>
        <div className={styles.headerContent}>
          <div
            className={styles.headerIcon}
            style={{ background: course.color + '25', color: course.color }}
          >
            <i className={`fa-solid ${course.icon}`} aria-hidden="true" />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.headerMeta}>
              <Badge variant="primary" icon="fa-wand-magic-sparkles">
                Contenido adaptado
              </Badge>
              {styleInfo && (
                <Badge variant={profile.primary} icon={styleInfo.icon}>
                  {styleInfo.label}
                </Badge>
              )}
              {course.curriculumAligned && (
                <Badge variant="success" icon="fa-graduation-cap">
                  Alineado MEN
                </Badge>
              )}
            </div>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDesc}>{course.description}</p>
            <div className={styles.courseMeta}>
              <span>
                <i className="fa-solid fa-user-tie" aria-hidden="true" /> {course.instructor}
              </span>
              <span>
                <i
                  className="fa-solid fa-star"
                  aria-hidden="true"
                  style={{ color: 'var(--color-warning)' }}
                />{' '}
                {course.rating}
              </span>
              <span>
                <i className="fa-solid fa-users" aria-hidden="true" /> {course.enrolled} estudiantes
              </span>
              <span>
                <i className="fa-solid fa-clock" aria-hidden="true" /> ~
                {course.estimatedHours[profile?.primary || 'visual']}h
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Módulos y lecciones */}
        <main className={styles.main}>
          <h2 className={styles.sectionTitle}>Contenido del curso</h2>
          <div className={styles.modules}>
            {course.modules.map((mod) => {
              const modLessons = lessons.filter((l) => l.moduleId === mod.id);
              const isOpen = openModule === mod.id;
              return (
                <div key={mod.id} className={styles.module}>
                  <button
                    className={styles.moduleHeader}
                    onClick={() => setOpenModule(isOpen ? null : mod.id)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.moduleLeft}>
                      <i
                        className={`fa-solid ${mod.completed ? 'fa-circle-check' : 'fa-circle'}`}
                        aria-hidden="true"
                        style={{
                          color: mod.completed
                            ? 'var(--color-success)'
                            : 'var(--color-text-tertiary)',
                        }}
                      />
                      <div>
                        <p className={styles.moduleTitle}>{mod.title}</p>
                        <p className={styles.moduleDesc}>{mod.description}</p>
                      </div>
                    </div>
                    <i
                      className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <ul className={styles.lessonList}>
                      {modLessons.length > 0 ? (
                        modLessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className={styles.lessonItem}
                            onClick={() => navigate(lessonPath(id, lesson.id))}
                          >
                            <div
                              className={styles.lessonIcon}
                              style={{
                                background: lesson.completed
                                  ? 'var(--color-success-bg)'
                                  : 'var(--color-surface-muted)',
                              }}
                            >
                              <i
                                className={`fa-solid ${lesson.completed ? 'fa-check' : TYPE_ICONS[lesson.type] || 'fa-circle'}`}
                                aria-hidden="true"
                                style={{
                                  color: lesson.completed
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-tertiary)',
                                }}
                              />
                            </div>
                            <div className={styles.lessonInfo}>
                              <p className={styles.lessonTitle}>{lesson.title}</p>
                              <p className={styles.lessonMeta}>
                                {TYPE_LABELS[lesson.type]} · {formatDuration(lesson.duration)}
                              </p>
                            </div>
                            <i
                              className="fa-solid fa-arrow-right"
                              aria-hidden="true"
                              style={{
                                color: 'var(--color-text-tertiary)',
                                fontSize: 'var(--fs-sm)',
                              }}
                            />
                          </li>
                        ))
                      ) : (
                        <li className={styles.lessonEmpty}>Lecciones próximamente</li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <Card padding="md">
            <h3 className={styles.sideTitle}>Tu progreso</h3>
            <ProgressBar value={Math.round(course.progress * 100)} label="Completado" showPercent />
            {firstLesson && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(lessonPath(id, firstLesson.id))}
                icon="fa-play"
                style={{ marginTop: 'var(--space-5)' }}
              >
                {firstLesson.completed ? 'Continuar curso' : 'Comenzar primera lección'}
              </Button>
            )}
          </Card>
          <Card padding="md">
            <div className={styles.aiBox}>
              <div className={styles.aiAvatar}>
                <i className="fa-solid fa-robot" aria-hidden="true" />
              </div>
              <div>
                <p className={styles.aiName}>Tutor IA recomienda</p>
                <p className={styles.aiMsg}>
                  Basado en tu perfil {styleInfo?.label}, este curso está optimizado para ti. ¡El
                  módulo 1 es el mejor punto de partida!
                </p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <h3 className={styles.sideTitle}>Etiquetas</h3>
            <div className={styles.tags}>
              {course.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
