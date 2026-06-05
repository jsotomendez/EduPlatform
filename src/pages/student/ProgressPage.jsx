import { useEffect, useMemo } from 'react';
import { useProgressData } from '../../hooks/useProgress';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { WeeklyProgressChart } from '../../components/charts/WeeklyProgressChart';
import { RadarVAK } from '../../components/charts/RadarVAK';
import { Skeleton } from '../../components/feedback/Skeleton';
import { formatRelativeDate } from '../../utils/formatters';
import styles from './ProgressPage.module.css';

const COURSE_COLORS = [
  { bg: 'rgba(124, 92, 252, 0.12)', fg: '#7c5cfc', bar: 'linear-gradient(90deg, #7c5cfc, #a78bfa)' },
  { bg: 'rgba(59, 130, 246, 0.12)', fg: '#3b82f6', bar: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
  { bg: 'rgba(16, 185, 129, 0.12)', fg: '#10b981', bar: 'linear-gradient(90deg, #10b981, #34d399)' },
  { bg: 'rgba(245, 158, 11, 0.12)', fg: '#f59e0b', bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
  { bg: 'rgba(239, 68, 68, 0.12)', fg: '#ef4444', bar: 'linear-gradient(90deg, #ef4444, #f87171)' },
  { bg: 'rgba(168, 85, 247, 0.12)', fg: '#a855f7', bar: 'linear-gradient(90deg, #a855f7, #c084fc)' },
];

const COURSE_ICONS = [
  'fa-calculator', 'fa-leaf', 'fa-code', 'fa-pen-nib', 'fa-infinity', 'fa-recycle'
];

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function ProgressPage() {
  const { weekly, badges, activities, courseProgress, vakRadar, isLoading, loadAll } =
    useProgressData();
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Compute hero stats from data
  const stats = useMemo(() => {
    const totalMinutes = weekly?.reduce((sum, w) => sum + (w.minutes || w.value || 0), 0) || 0;
    const completedLessons = activities?.filter(a => a.icon?.includes('check') || a.icon?.includes('graduation')).length || 0;
    const avgProgress = courseProgress?.length
      ? Math.round(courseProgress.reduce((s, c) => s + (c.progress || 0), 0) / courseProgress.length)
      : 0;
    const earnedBadges = badges?.filter(b => b.earned).length || 0;
    return { totalMinutes, completedLessons, avgProgress, earnedBadges };
  }, [weekly, activities, courseProgress, badges]);

  // Simulated streak (based on weekly data)
  const streakData = useMemo(() => {
    const today = new Date().getDay(); // 0=Sun, 1=Mon
    const todayIdx = today === 0 ? 6 : today - 1; // Convert to 0=Mon
    return WEEK_DAYS.map((day, i) => ({
      label: day,
      active: weekly?.[i] && (weekly[i].minutes || weekly[i].value || 0) > 0,
      isToday: i === todayIdx,
    }));
  }, [weekly]);

  const streakCount = useMemo(() => {
    let count = 0;
    for (let i = streakData.length - 1; i >= 0; i--) {
      if (streakData[i].active || streakData[i].isToday) count++;
      else if (count > 0) break;
    }
    return Math.max(count, 1);
  }, [streakData]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Mi Progreso</h1>
        <p className={styles.subtitle}>Visualiza tu avance y logros de aprendizaje</p>
      </header>

      {/* Hero Stats */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={`${styles.statIconWrap} ${styles.statIconPurple}`}>
            <i className="fa-solid fa-clock" aria-hidden="true" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {isLoading ? '—' : `${stats.totalMinutes}`}
            </span>
            <span className={styles.statLabel}>Min. esta semana</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={`${styles.statIconWrap} ${styles.statIconBlue}`}>
            <i className="fa-solid fa-book-open" aria-hidden="true" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {isLoading ? '—' : courseProgress?.length || 0}
            </span>
            <span className={styles.statLabel}>Cursos activos</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>
            <i className="fa-solid fa-chart-line" aria-hidden="true" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {isLoading ? '—' : `${stats.avgProgress}%`}
            </span>
            <span className={styles.statLabel}>Promedio general</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <div className={`${styles.statIconWrap} ${styles.statIconAmber}`}>
            <i className="fa-solid fa-trophy" aria-hidden="true" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {isLoading ? '—' : stats.earnedBadges}
            </span>
            <span className={styles.statLabel}>Logros ganados</span>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className={styles.streakSection}>
        <div className={styles.streakFireWrap}>🔥</div>
        <div className={styles.streakInfo}>
          <div className={styles.streakCount}>{streakCount} días</div>
          <div className={styles.streakLabel}>Racha de estudio activa</div>
        </div>
        <div className={styles.streakDays}>
          {streakData.map((d, i) => (
            <div
              key={i}
              className={`${styles.streakDay} ${d.active ? styles.streakDayActive : ''} ${d.isToday ? styles.streakDayToday : ''}`}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Progreso semanal */}
          <Card padding="md">
            <h2 className={styles.cardTitle}>
              <i className={`fa-solid fa-chart-area ${styles.cardTitleIcon}`} aria-hidden="true" />
              Minutos de estudio esta semana
            </h2>
            {isLoading ? <Skeleton height="200px" /> : <WeeklyProgressChart data={weekly} />}
          </Card>

          {/* Progreso por curso */}
          <Card padding="md">
            <h2 className={styles.cardTitle}>
              <i className={`fa-solid fa-graduation-cap ${styles.cardTitleIcon}`} aria-hidden="true" />
              Progreso por curso
            </h2>
            {isLoading ? (
              <Skeleton height="200px" />
            ) : (
              <div className={styles.courseList}>
                {courseProgress?.map((cp, i) => {
                  const color = COURSE_COLORS[i % COURSE_COLORS.length];
                  const icon = COURSE_ICONS[i % COURSE_ICONS.length];
                  return (
                    <div key={cp.course || i} className={styles.courseItem}>
                      <div
                        className={styles.courseIcon}
                        style={{ background: color.bg, color: color.fg }}
                      >
                        <i className={`fa-solid ${icon}`} aria-hidden="true" />
                      </div>
                      <div className={styles.courseInfo}>
                        <p className={styles.courseName}>{cp.course}</p>
                        <div className={styles.courseProgressRow}>
                          <div className={styles.courseBar}>
                            <div
                              className={styles.courseBarFill}
                              style={{
                                width: `${cp.progress || 0}%`,
                                background: color.bar,
                              }}
                            />
                          </div>
                          <span className={styles.coursePercent}>{cp.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Perfil VAK */}
          <Card padding="md">
            <h2 className={styles.cardTitle}>
              <i className={`fa-solid fa-brain ${styles.cardTitleIcon}`} aria-hidden="true" />
              Tu perfil cognitivo
            </h2>
            {isLoading ? <Skeleton height="200px" /> : <RadarVAK data={vakRadar} />}
          </Card>

          {/* Actividad reciente */}
          <Card padding="md">
            <h2 className={styles.cardTitle}>
              <i className={`fa-solid fa-timeline ${styles.cardTitleIcon}`} aria-hidden="true" />
              Actividad reciente
            </h2>
            <ul className={styles.activities}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <Skeleton height="44px" />
                    </li>
                  ))
                : activities.map((a) => (
                    <li key={a.id} className={styles.activity}>
                      <div
                        className={styles.actDot}
                        style={{ background: a.color || 'var(--color-brand-primary)' }}
                      />
                      <div className={styles.actInfo}>
                        <p className={styles.actTitle}>{a.title}</p>
                        {a.course && <p className={styles.actCourse}>{a.course}</p>}
                      </div>
                      <span className={styles.actTime}>{formatRelativeDate(a.timestamp)}</span>
                    </li>
                  ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Logros — full width */}
      <Card padding="md">
        <h2 className={styles.cardTitle}>
          <i className={`fa-solid fa-medal ${styles.cardTitleIcon}`} aria-hidden="true" />
          Logros desbloqueados
        </h2>
        <div className={styles.badgesGrid}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} width="80px" height="80px" borderRadius="full" />
              ))
            : badges.map((badge) => (
                <div
                  key={badge.id}
                  className={[styles.badge, !badge.earned ? styles.badgeLocked : '']
                    .filter(Boolean)
                    .join(' ')}
                  title={badge.earned ? `✅ ${badge.title}` : `🔒 ${badge.title} — Aún no desbloqueado`}
                >
                  <div
                    className={`${styles.badgeIcon} ${badge.earned ? styles.badgeEarned : ''}`}
                    style={{
                      background: badge.earned
                        ? badge.color + '20'
                        : 'var(--color-surface-muted)',
                      color: badge.earned ? badge.color : 'var(--color-text-tertiary)',
                    }}
                  >
                    <i className={`fa-solid ${badge.icon}`} aria-hidden="true" />
                    {!badge.earned && (
                      <div className={styles.badgeLockOverlay}>
                        <i className="fa-solid fa-lock" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <span className={styles.badgeName}>{badge.title}</span>
                  {badge.earned && (
                    <Badge variant="success" size="sm">
                      ✓ Ganado
                    </Badge>
                  )}
                </div>
              ))}
        </div>
      </Card>
    </div>
  );
}
