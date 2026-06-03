import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../feedback/Toast';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import { AITutorChat } from '../feedback/AITutorChat';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useNotifications();
  const { user } = useUser();

  const isStudent = user?.role === 'student';

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.content}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.main} id="main-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      {isStudent && <AITutorChat />}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
