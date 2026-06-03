import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authService } from '../services/auth.service';
import { useNotifications } from '../context/NotificationContext';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/config';
import { MSG } from '../constants/messages';

export function useAuth() {
  const { login, logout: contextLogout, setLoading, isLoading } = useUser();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogin = useCallback(
    async (email, password) => {
      setError(null);
      setLoading(true);
      try {
        const user = await authService.login(email, password);
        login(user);
        addToast({ type: 'success', message: MSG.success.loggedIn });
        if (user.role === USER_ROLES.TEACHER) {
          navigate(ROUTES.TEACHER_DASHBOARD);
        } else if (!user.cognitiveProfile) {
          navigate(ROUTES.WELCOME);
        } else {
          navigate(ROUTES.STUDENT_DASHBOARD);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    },
    [login, navigate, setLoading, addToast]
  );

  const handleRegister = useCallback(
    async (data) => {
      setError(null);
      setLoading(true);
      try {
        const user = await authService.register(data);
        login(user);
        addToast({ type: 'success', message: MSG.success.registered });
        if (user.role === USER_ROLES.TEACHER) {
          navigate(ROUTES.TEACHER_DASHBOARD);
        } else {
          navigate(ROUTES.WELCOME);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    },
    [login, navigate, setLoading, addToast]
  );

  const handleLoadDemo = useCallback(
    async (role = 'student') => {
      setLoading(true);
      try {
        const user =
          role === 'teacher'
            ? await authService.loadDemoTeacher()
            : await authService.loadDemoStudent();
        login(user);
        if (user.role === USER_ROLES.TEACHER) {
          navigate(ROUTES.TEACHER_DASHBOARD);
        } else {
          navigate(ROUTES.STUDENT_DASHBOARD);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    },
    [login, navigate, setLoading]
  );

  const handleLogout = useCallback(async () => {
    await authService.logout();
    contextLogout();
    navigate(ROUTES.LOGIN);
  }, [contextLogout, navigate]);

  return { handleLogin, handleRegister, handleLoadDemo, handleLogout, isLoading, error, setError };
}
