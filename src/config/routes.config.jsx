import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { WelcomePage } from '../pages/onboarding/WelcomePage';
import { DiagnosticPage } from '../pages/onboarding/DiagnosticPage';
import { DashboardPage } from '../pages/student/DashboardPage';
import { CoursesPage } from '../pages/student/CoursesPage';
import { CourseDetailPage } from '../pages/student/CourseDetailPage';
import { LessonPage } from '../pages/student/LessonPage';
import { ProgressPage } from '../pages/student/ProgressPage';
import { CommunityPage } from '../pages/student/CommunityPage';
import { SettingsPage } from '../pages/student/SettingsPage';
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TeacherCoursesPage } from '../pages/teacher/TeacherCoursesPage';
import { TeacherSettingsPage } from '../pages/teacher/TeacherSettingsPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';
import { AIChatPage } from '../pages/shared/AIChatPage';
import { ProtectedRoute } from './ProtectedRoute';

export const routerConfig = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'diagnostic', element: <DiagnosticPage /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute role="student">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'courses/:id/lessons/:lessonId', element: <LessonPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'ai-chat', element: <AIChatPage /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute role="teacher">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'courses', element: <TeacherCoursesPage /> },
      { path: 'settings', element: <TeacherSettingsPage /> },
      { path: 'ai-chat', element: <AIChatPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
