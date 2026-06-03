import styles from './Badge.module.css';

/**
 * @param {'default'|'primary'|'success'|'warning'|'danger'|'info'|'visual'|'auditory'|'kinesthetic'|'risk-low'|'risk-medium'|'risk-high'} variant
 * @param {'sm'|'md'} size
 */
export function Badge({ children, variant = 'default', size = 'sm', icon = null, className = '' }) {
  const classes = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes}>
      {icon && <i className={`fa-solid ${icon}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
