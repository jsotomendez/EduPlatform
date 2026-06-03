import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { ROUTES } from '../../constants/routes';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { capitalize } from '../../utils/formatters';
import styles from './Sidebar.module.css';

const STUDENT_NAV_ITEMS = [
  { to: ROUTES.STUDENT_DASHBOARD, icon: 'fa-house', label: 'Inicio' },
  { to: ROUTES.STUDENT_COURSES, icon: 'fa-book-open', label: 'Mis Cursos' },
  { to: ROUTES.STUDENT_PROGRESS, icon: 'fa-chart-line', label: 'Mi Progreso' },
  { to: ROUTES.STUDENT_COMMUNITY, icon: 'fa-users', label: 'Comunidad' },
  { to: ROUTES.STUDENT_SETTINGS, icon: 'fa-gear', label: 'Configuración' },
];

const TEACHER_NAV_ITEMS = [
  { to: ROUTES.TEACHER_DASHBOARD, icon: 'fa-house', label: 'Inicio' },
  { to: ROUTES.TEACHER_COURSES, icon: 'fa-book-open', label: 'Cursos' },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const profile = user?.cognitiveProfile;
  const styleInfo = profile ? LEARNING_STYLES[profile.primary] : null;
  const navItems = user?.role === 'teacher' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} aria-hidden="true" />}
      <nav
        className={[styles.sidebar, isOpen ? styles.open : ''].filter(Boolean).join(' ')}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <i className="fa-solid fa-brain" aria-hidden="true" />
          </div>
          <span className={styles.logoText}>EduPlatform</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {/* Navegación */}
        <ul className={styles.nav}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
                }
                onClick={onClose}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Perfil del usuario */}
        {user && (
          <div className={styles.userCard}>
            <Avatar name={user.name} size="md" />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.name.split(' ')[0]}</p>
              <p className={styles.userDetail}>{user.university}</p>
              {styleInfo && (
                <Badge variant={profile.primary} size="sm" icon={styleInfo.icon}>
                  {capitalize(styleInfo.label)}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Cerrar sesión */}
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Cerrar sesión">
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </>
  );
}
