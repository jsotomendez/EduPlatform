import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useUser } from '../../context/UserContext';
import styles from './MobileNav.module.css';

const STUDENT_NAV_ITEMS = [
  { to: ROUTES.STUDENT_DASHBOARD, icon: 'fa-house', label: 'Inicio' },
  { to: ROUTES.STUDENT_COURSES, icon: 'fa-book-open', label: 'Cursos' },
  { to: ROUTES.STUDENT_PROGRESS, icon: 'fa-chart-line', label: 'Progreso' },
  { to: ROUTES.STUDENT_COMMUNITY, icon: 'fa-users', label: 'Comunidad' },
];

const TEACHER_NAV_ITEMS = [
  { to: ROUTES.TEACHER_DASHBOARD, icon: 'fa-house', label: 'Inicio' },
  { to: ROUTES.TEACHER_COURSES, icon: 'fa-book-open', label: 'Cursos' },
];

export function MobileNav() {
  const { user } = useUser();
  const navItems = user?.role === 'teacher' ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <nav className={styles.nav} aria-label="Navegación móvil">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
