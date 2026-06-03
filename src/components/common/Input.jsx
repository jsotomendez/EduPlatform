import styles from './Input.module.css';

export function Input({
  label,
  id,
  error,
  hint,
  icon,
  type = 'text',
  required = false,
  className = '',
  ...rest
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span aria-hidden="true" className={styles.required}>
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <div className={styles.wrapper}>
        {icon && (
          <span className={styles.iconLeft} aria-hidden="true">
            <i className={`fa-solid ${icon}`} />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={[styles.input, icon ? styles.hasIcon : '', error ? styles.hasError : '']
            .filter(Boolean)
            .join(' ')}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          required={required}
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </p>
      )}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
