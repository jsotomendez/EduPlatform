export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  WELCOME: '/onboarding/welcome',
  DIAGNOSTIC: '/onboarding/diagnostic',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  STUDENT_COURSE_DETAIL: '/student/courses/:id',
  STUDENT_LESSON: '/student/courses/:id/lessons/:lessonId',
  STUDENT_PROGRESS: '/student/progress',
  STUDENT_COMMUNITY: '/student/community',
  STUDENT_SETTINGS: '/student/settings',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_COURSES: '/teacher/courses',
  ACCESSIBILITY: '/accesibilidad',
  DEV_COMPONENTS: '/dev/components',
  NOT_FOUND: '*',
};

/** @param {string} courseId @param {string} lessonId */
export const lessonPath = (courseId, lessonId) =>
  `/student/courses/${courseId}/lessons/${lessonId}`;

/** @param {string} courseId */
export const courseDetailPath = (courseId) => `/student/courses/${courseId}`;
