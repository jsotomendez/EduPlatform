import styles from './Avatar.module.css';

/** @param {'xs'|'sm'|'md'|'lg'|'xl'} size */
export function Avatar({ src, name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const colorIndex = name.charCodeAt(0) % 6;
  const colors = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#ef4444'];

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      />
    );
  }

  return (
    <div
      className={[styles.avatar, styles[size], styles.initials, className]
        .filter(Boolean)
        .join(' ')}
      style={{ background: colors[colorIndex] }}
      aria-label={name || 'Usuario'}
    >
      {initials || <i className="fa-solid fa-user" aria-hidden="true" />}
    </div>
  );
}
