import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';
import { getDayGreeting } from '../../utils/formatters';
import { THEMES } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import styles from './Topbar.module.css';

export function Topbar({ onMenuClick }) {
  const { user, logout } = useUser();
  const { theme, setTheme, isDark } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleThemeToggle = () => setTheme(isDark ? THEMES.LIGHT : THEMES.DARK);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className={styles.topbar} role="banner">
      {/* Botón menú móvil */}
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Abrir menú de navegación"
      >
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>

      {/* Saludo */}
      <div className={styles.greeting}>
        <p className={styles.greetingText}>
          {getDayGreeting(user?.name?.split(' ')[0] || 'Estudiante')}
        </p>
        <p className={styles.greetingSubtext}>¿Qué vas a aprender hoy?</p>
      </div>

      <div className={styles.actions}>
        {/* Toggle tema */}
        <button
          className={styles.iconBtn}
          onClick={handleThemeToggle}
          aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={isDark ? 'Tema claro' : 'Tema oscuro'}
        >
          <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
        </button>

        {/* Notificaciones */}
        <div className={styles.notifWrapper}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label={`Notificaciones, ${unreadCount} sin leer`}
          >
            <i className="fa-solid fa-bell" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className={styles.dropdown} role="menu" aria-label="Notificaciones">
              <p className={styles.dropdownTitle}>Notificaciones</p>
              <div className={styles.notifItem}>
                <i className="fa-solid fa-book-open" aria-hidden="true" />
                <span>Nueva lección disponible en Matemáticas</span>
              </div>
              <div className={styles.notifItem}>
                <i className="fa-solid fa-fire" aria-hidden="true" />
                <span>¡Llevas 7 días de racha!</span>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + menú usuario */}
        <div className={styles.userWrapper}>
          <button
            className={styles.avatarBtn}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menú de usuario"
            aria-expanded={showUserMenu}
          >
            <Avatar name={user?.name || ''} size="sm" />
            <i
              className="fa-solid fa-chevron-down"
              aria-hidden="true"
              style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}
            />
          </button>
          {showUserMenu && (
            <div className={styles.dropdown} role="menu">
              <p className={styles.dropdownUser}>{user?.name}</p>
              <p className={styles.dropdownEmail}>{user?.email}</p>
              <hr className={styles.divider} />
              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.STUDENT_SETTINGS);
                  setShowUserMenu(false);
                }}
              >
                <i className="fa-solid fa-gear" aria-hidden="true" /> Configuración
              </button>
              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => {
                  navigate(ROUTES.STUDENT_SETTINGS);
                  setShowUserMenu(false);
                }}
              >
                <i className="fa-solid fa-universal-access" aria-hidden="true" /> Accesibilidad
              </button>
              <hr className={styles.divider} />
              <button
                className={[styles.dropdownItem, styles.danger].join(' ')}
                role="menuitem"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
