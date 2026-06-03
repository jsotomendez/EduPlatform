import styles from './Button.module.css';

/**
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && icon && iconPosition === 'left' && (
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      )}
    </button>
  );
}
