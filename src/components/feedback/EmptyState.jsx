import styles from './EmptyState.module.css';
import { Button } from '../common/Button';

export function EmptyState({
  icon = 'fa-inbox',
  title = 'Nada por aquí',
  description = '',
  action = null,
  actionLabel = 'Comenzar',
}) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button onClick={action} variant="primary" icon="fa-arrow-right" iconPosition="right">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
