import { useRoutes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProgressProvider } from './context/ProgressContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { routerConfig } from './config/routes.config';

function AppRoutes() {
  return useRoutes(routerConfig);
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <ProgressProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </ProgressProvider>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
