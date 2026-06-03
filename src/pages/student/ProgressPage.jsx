import { useEffect } from 'react';
import { useProgressData } from '../../hooks/useProgress';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { WeeklyProgressChart } from '../../components/charts/WeeklyProgressChart';
import { RadarVAK } from '../../components/charts/RadarVAK';
import { Skeleton } from '../../components/feedback/Skeleton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { formatRelativeDate } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ProgressPage.module.css';

export function ProgressPage() {
  const { weekly, badges, activities, courseProgress, vakRadar, isLoading, loadAll } =
    useProgressData();
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Mi Progreso</h1>
        <p className={styles.subtitle}>Visualiza tu avance y logros de aprendizaje</p>
      </header>

      <div className={styles.grid}>
        {/* Progreso semanal */}
        <Card padding="md" className={styles.wide}>
          <h2 className={styles.cardTitle}>Minutos de estudio esta semana</h2>
          {isLoading ? <Skeleton height="200px" /> : <WeeklyProgressChart data={weekly} />}
        </Card>

        {/* Perfil VAK */}
        <Card padding="md">
          <h2 className={styles.cardTitle}>Tu perfil cognitivo</h2>
          {isLoading ? <Skeleton height="200px" /> : <RadarVAK data={vakRadar} />}
        </Card>

        {/* Progreso por curso */}
        <Card padding="md" className={styles.wide}>
          <h2 className={styles.cardTitle}>Progreso por curso</h2>
          {isLoading ? (
            <Skeleton height="200px" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={courseProgress} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="course"
                  tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Progreso']}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="progress" fill="var(--color-brand-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Logros y badges */}
        <Card padding="md" className={styles.wide}>
          <h2 className={styles.cardTitle}>Logros desbloqueados</h2>
          <div className={styles.badges}>
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
                    title={badge.title}
                  >
                    <div
                      className={styles.badgeIcon}
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
                        Ganado
                      </Badge>
                    )}
                  </div>
                ))}
          </div>
        </Card>

        {/* Actividad reciente */}
        <Card padding="md">
          <h2 className={styles.cardTitle}>Actividad reciente</h2>
          <ul className={styles.activities}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i}>
                    <Skeleton height="44px" />
                  </li>
                ))
              : activities.map((a) => (
                  <li key={a.id} className={styles.activity}>
                    <div className={styles.actIcon} style={{ color: a.color }}>
                      <i className={`fa-solid ${a.icon}`} aria-hidden="true" />
                    </div>
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
  );
}
