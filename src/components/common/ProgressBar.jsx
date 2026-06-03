import styles from './ProgressBar.module.css';

/**
 * @param {number} value - 0 a 100
 * @param {'brand'|'success'|'warning'|'danger'} color
 * @param {'sm'|'md'|'lg'} size
 */
export function ProgressBar({
  value = 0,
  color = 'brand',
  size = 'md',
  label = null,
  showPercent = false,
  animated = true,
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={styles.wrapper}>
      {(label || showPercent) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercent && <span className={styles.percent}>{clamped}%</span>}
        </div>
      )}
      <div
        className={[styles.track, styles[size]].join(' ')}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progreso: ${clamped}%`}
      >
        <div
          className={[styles.bar, styles[color], animated ? styles.animated : '']
            .filter(Boolean)
            .join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
