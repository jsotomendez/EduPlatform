import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useProgressData } from '../../hooks/useProgress';
import { useAITutor } from '../../hooks/useAITutor';
import { useDropoutRisk } from '../../hooks/useDropoutRisk';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { WeeklyProgressChart } from '../../components/charts/WeeklyProgressChart';
import { Skeleton, SkeletonCard } from '../../components/feedback/Skeleton';
import { courseService } from '../../services/course.service';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { formatPercent, formatRelativeDate } from '../../utils/formatters';
import { courseDetailPath, lessonPath } from '../../constants/routes';
import styles from './DashboardPage.module.css';

const getTaskRoute = (task) => {
  const title = task.title.toLowerCase();
  const course = task.course.toLowerCase();

  if (course.includes('matemát')) {
    if (title.includes('función') || title.includes('funciones')) {
      return `/student/courses/c_001/lessons/l_004`;
    }
    if (title.includes('primer grado') || title.includes('ecuaciones')) {
      return `/student/courses/c_001/lessons/l_003`;
    }
    if (title.includes('expresiones') || title.includes('algebraicas')) {
      return `/student/courses/c_001/lessons/l_002`;
    }
    return `/student/courses/c_001/lessons/l_001`;
  }

  if (course.includes('sostenib') || course.includes('circular')) {
    return `/student/courses/c_002/lessons/l_009`;
  }

  return null;
};

export function DashboardPage() {
  const { user } = useUser();
  const { weekly, monthly, tasks, isLoading, loadAll, toggleTask } = useProgressData();
  const { message: aiMessage, messageType, initTutor } = useAITutor();
  const risk = useDropoutRisk();
  const navigate = useNavigate();
  const [progressPeriod, setProgressPeriod] = useState('weekly');
  const [activeStyle, setActiveStyle] = useState(user?.cognitiveProfile?.primary || 'visual');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadAll();
    initTutor();
    courseService.getCourses().then((data) => setCourses(data));
  }, [loadAll, initTutor]);

  const profile = user?.cognitiveProfile;
  const styleInfo = profile ? LEARNING_STYLES[profile.primary] : null;

  const enrolledCourses = courses.filter(
    (c) => user?.enrolledCourses?.includes(c.id) && c.status === 'in_progress'
  );
  const currentCourse = enrolledCourses[0];
  const currentLesson = currentCourse
    ? { id: 'l_004', title: 'Concepto de Función', type: profile?.primary || 'visual' }
    : null;

  const riskBadgeVariant = `risk-${risk.level}`;

  return (
    <div className={styles.page}>
      {/* ── HERO: Curso actual ── */}
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          {isLoading && !currentCourse ? (
            <SkeletonCard />
          ) : currentCourse ? (
            <Card glass className={styles.courseCard} padding="lg">
              <div className={styles.courseHeader}>
                <div
                  className={styles.courseIconWrap}
                  style={{ background: currentCourse.color + '20' }}
                >
                  <i
                    className={`fa-solid ${currentCourse.icon}`}
                    style={{ color: currentCourse.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.courseInfo}>
                  <div className={styles.courseMeta}>
                    <Badge variant="success" icon="fa-wand-magic-sparkles">
                      Contenido adaptado
                    </Badge>
                    <Badge variant={profile?.primary || 'visual'} icon={styleInfo?.icon}>
                      {styleInfo?.label || 'Visual'}
                    </Badge>
                  </div>
                  <h2 className={styles.courseTitle}>{currentCourse.title}</h2>
                  <p className={styles.courseDesc}>{currentCourse.description}</p>
                </div>
              </div>

              {/* Selector de modalidad */}
              <div className={styles.styleSelector}>
                <span className={styles.styleSelectorLabel}>Cambiar modalidad:</span>
                <div className={styles.styleTabs}>
                  {['visual', 'auditory', 'kinesthetic'].map((s) => {
                    const si = LEARNING_STYLES[s];
                    return (
                      <button
                        key={s}
                        className={[styles.styleTab, activeStyle === s ? styles.styleTabActive : '']
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setActiveStyle(s)}
                        style={
                          activeStyle === s
                            ? { background: si.bg, color: si.color, borderColor: si.color }
                            : {}
                        }
                        aria-pressed={activeStyle === s}
                        aria-label={`Cambiar a modo ${si.label}`}
                      >
                        <i className={`fa-solid ${si.icon}`} aria-hidden="true" />
                        <span>{si.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reproductor adaptativo */}
              <AdaptivePlayer style={activeStyle} lesson={currentLesson} />

              {/* Progreso del curso */}
              <div className={styles.courseProgress}>
                <ProgressBar
                  value={Math.round(currentCourse.progress * 100)}
                  label="Progreso del curso"
                  showPercent
                  color="brand"
                />
              </div>

              <button
                className={styles.continueCta}
                onClick={() => navigate(courseDetailPath(currentCourse.id))}
                aria-label={`Continuar con ${currentCourse.title}`}
              >
                <i className="fa-solid fa-play" aria-hidden="true" />
                Continuar lección
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </Card>
          ) : (
            <Card padding="lg" className={styles.noCourseCard}>
              <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
              <h3>Aún no tienes cursos activos</h3>
              <button className={styles.exploreCta} onClick={() => navigate('/student/courses')}>
                Explorar cursos
              </button>
            </Card>
          )}
        </div>

        {/* ── Sidebar del dashboard ── */}
        <aside className={styles.heroSide}>
          {/* Progreso semanal */}
          <Card padding="md">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Progreso de estudio</h3>
              <div className={styles.periodTabs}>
                {['weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    className={[
                      styles.periodTab,
                      progressPeriod === p ? styles.periodTabActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setProgressPeriod(p)}
                  >
                    {p === 'weekly' ? 'Semana' : 'Mes'}
                  </button>
                ))}
              </div>
            </div>
            {isLoading ? (
              <Skeleton height="160px" />
            ) : (
              <WeeklyProgressChart data={progressPeriod === 'weekly' ? weekly : monthly} />
            )}
          </Card>

          {/* Tutor IA + Riesgo */}
          <div className={styles.sideGrid}>
            {/* Avance circular */}
            <Card padding="md" className={styles.progressCircleCard}>
              <CircularProgress
                value={currentCourse ? Math.round(currentCourse.progress * 100) : 0}
              />
              <p className={styles.circleLabel}>Módulo actual</p>
            </Card>

            {/* Tutor IA */}
            <Card
              padding="md"
              className={styles.aiCard}
              hoverable
              onClick={() => window.dispatchEvent(new Event('open-ai-tutor'))}
            >
              <div className={styles.aiHeader}>
                <div className={styles.aiAvatar}>
                  <i className="fa-solid fa-robot" aria-hidden="true" />
                </div>
                <div>
                  <p className={styles.aiName}>Tutor IA</p>
                  <Badge variant={riskBadgeVariant} size="sm">
                    Riesgo: {risk.label}
                  </Badge>
                </div>
              </div>
              {aiMessage ? (
                <>
                  <p className={styles.aiMessage}>{aiMessage}</p>
                  <div className={styles.aiChatCta}>
                    <i className="fa-solid fa-comments" /> Hablar con Tutor IA
                  </div>
                </>
              ) : (
                <Skeleton height="60px" />
              )}
            </Card>
          </div>

          {/* Próximas tareas */}
          <Card padding="md">
            <h3 className={styles.cardTitle} style={{ marginBottom: 'var(--space-4)' }}>
              Próximas tareas
            </h3>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="44px" />
                ))}
              </div>
            ) : (
              <ul className={styles.taskList}>
                {tasks.slice(0, 4).map((task) => {
                  const taskRoute = getTaskRoute(task);
                  const isCompleted = task.status === 'completed';
                  return (
                    <li
                      key={task.id}
                      className={`${styles.taskItem} ${isCompleted ? styles.taskCompleted : ''}`}
                    >
                      <button
                        className={styles.taskCheckBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        aria-label={
                          isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'
                        }
                      >
                        <i
                          className={`fa-solid ${isCompleted ? 'fa-square-check' : 'fa-square'}`}
                        />
                      </button>
                      <div className={styles.taskInfo}>
                        {taskRoute && !isCompleted ? (
                          <button
                            className={styles.taskTitleLink}
                            onClick={() => navigate(taskRoute)}
                            title="Ir a la lección de la tarea"
                          >
                            {task.title}
                          </button>
                        ) : (
                          <p className={styles.taskTitle}>{task.title}</p>
                        )}
                        <p className={styles.taskMeta}>
                          {task.course} · {task.dueDate}
                        </p>
                      </div>
                      <span
                        className={[
                          styles.taskStatus,
                          task.status === 'in_progress' ? styles.taskInProgress : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {isCompleted
                          ? 'Completado'
                          : task.status === 'in_progress'
                            ? 'En curso'
                            : 'Pendiente'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </aside>
      </section>

      {/* ── Mis cursos activos ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Mis rutas de aprendizaje</h2>
          <button className={styles.seeAll} onClick={() => navigate('/student/courses')}>
            Ver todas <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
        <div className={styles.coursesGrid}>
          {courses
            .filter((c) => user?.enrolledCourses?.includes(c.id))
            .slice(0, 3)
            .map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(courseDetailPath(course.id))}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

/* ── Subcomponentes ── */

function AdaptivePlayer({ style, lesson }) {
  if (!lesson) return null;
  const styleInfo = LEARNING_STYLES[style];

  const content = {
    visual: (
      <div className={styles.playerVisual}>
        <div className={styles.videoThumb}>
          <div className={styles.playBtn}>
            <i className="fa-solid fa-play" aria-hidden="true" />
          </div>
          <div className={styles.videoOverlay}>
            <span>Álgebra Módulo 2 · 15 min</span>
          </div>
        </div>
      </div>
    ),
    auditory: (
      <div className={styles.playerAudio}>
        <div className={styles.audioWave} aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={styles.audioBar}
              style={{ animationDelay: `${i * 80}ms`, height: `${20 + Math.sin(i) * 15}px` }}
            />
          ))}
        </div>
        <div className={styles.audioControls}>
          <button aria-label="Retroceder 15 segundos">
            <i className="fa-solid fa-rotate-left" />
          </button>
          <button className={styles.audioPlay} aria-label="Reproducir">
            <i className="fa-solid fa-play" />
          </button>
          <button aria-label="Avanzar 15 segundos">
            <i className="fa-solid fa-rotate-right" />
          </button>
        </div>
        <p className={styles.audioTitle}>Podcast: Concepto de Función · 18 min</p>
      </div>
    ),
    kinesthetic: (
      <div className={styles.playerKinesthetic}>
        <div className={styles.kinHeader}>
          <div className={styles.kinIcon}>
            <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
          </div>
          <div>
            <p className={styles.kinTitle}>Reto práctico: Construye tu máquina de funciones</p>
            <p className={styles.kinDesc}>Interactivo · 22 min</p>
          </div>
        </div>
        <div className={styles.kinSteps}>
          {[
            'Define tu regla matemática',
            'Prueba 3 entradas distintas',
            'Verifica que cada entrada da una sola salida',
          ].map((step, i) => (
            <div key={step} className={styles.kinStep}>
              <span className={styles.kinStepNum}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <button className={styles.kinStart}>
          <i className="fa-solid fa-rocket" /> Iniciar el reto
        </button>
      </div>
    ),
  };

  return (
    <div
      className={styles.player}
      style={{ borderColor: styleInfo.color + '30', background: styleInfo.bg }}
    >
      {content[style]}
    </div>
  );
}

function CircularProgress({ value }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className={styles.circularWrap}>
      <svg width={90} height={90} viewBox="0 0 90 90" aria-hidden="true">
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth="8"
        />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke="var(--color-brand-primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className={styles.circularValue}>{value}%</span>
    </div>
  );
}

function CourseCard({ course, onClick }) {
  const STATUS_MAP = {
    in_progress: { label: 'En curso', variant: 'primary' },
    completed: { label: 'Completado', variant: 'success' },
    recommended: { label: 'Recomendado IA', variant: 'info' },
    locked: { label: 'Bloqueado', variant: 'default' },
  };
  const status = STATUS_MAP[course.status] || STATUS_MAP.locked;

  return (
    <Card hoverable onClick={onClick} padding="md" className={styles.miniCourseCard}>
      <div
        className={styles.miniCourseIcon}
        style={{ background: course.color + '20', color: course.color }}
      >
        <i className={`fa-solid ${course.icon}`} aria-hidden="true" />
      </div>
      <div className={styles.miniCourseInfo}>
        <div className={styles.miniCourseMeta}>
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>
        <h4 className={styles.miniCourseTitle}>{course.title}</h4>
        <ProgressBar value={Math.round(course.progress * 100)} size="sm" />
        <p className={styles.miniCoursePercent}>{formatPercent(course.progress)} completado</p>
      </div>
    </Card>
  );
}
