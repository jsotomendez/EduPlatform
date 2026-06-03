import { createContext, useContext, useReducer, useCallback } from 'react';

const NotificationContext = createContext(null);

function notifReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.payload], notifications: state.notifications };
    case 'REMOVE':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n_001',
    title: 'Nueva lección disponible',
    body: 'El módulo 2 de Matemáticas está listo.',
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'n_002',
    title: '¡Racha de 7 días!',
    body: 'Llevas una semana estudiando sin parar. ¡Increíble!',
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'n_003',
    title: 'Recordatorio',
    body: 'Tienes un quiz pendiente en Desarrollo Sostenible.',
    read: true,
    timestamp: new Date().toISOString(),
  },
];

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notifReducer, {
    toasts: [],
    notifications: INITIAL_NOTIFICATIONS,
  });

  const addToast = useCallback((toast) => {
    const id = `toast_${Date.now()}`;
    dispatch({ type: 'ADD', payload: { id, ...toast } });
    setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE', payload: id }), []);
  const clearNotifications = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ ...state, addToast, removeToast, clearNotifications, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
