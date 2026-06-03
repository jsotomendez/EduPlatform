import styles from './Skeleton.module.css';

export function Skeleton({ width = '100%', height = '1rem', borderRadius = 'md', className = '' }) {
  return (
    <div
      className={[styles.skeleton, styles[`r-${borderRadius}`], className]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton height="120px" borderRadius="lg" />
      <div className={styles.lines}>
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.75rem" width="90%" />
        <Skeleton height="0.75rem" width="75%" />
      </div>
    </div>
  );
}
