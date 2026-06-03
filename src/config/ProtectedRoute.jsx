import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * Protege rutas que requieren autenticación.
 * Si role está definido, también verifica que el usuario tenga ese rol.
 */
export function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return (
      <Navigate
        to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
}
