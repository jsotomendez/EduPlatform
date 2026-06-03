import { createContext, useContext, useReducer, useCallback } from 'react';

const ProgressContext = createContext(null);

function progressReducer(state, action) {
  switch (action.type) {
    case 'SET_WEEKLY':
      return { ...state, weekly: action.payload };
    case 'SET_BADGES':
      return { ...state, badges: action.payload };
    case 'SET_TASKS':
      return { ...state, upcomingTasks: action.payload };
    case 'COMPLETE_TASK':
      return {
        ...state,
        upcomingTasks: state.upcomingTasks.map((t) =>
          t.id === action.payload ? { ...t, status: 'completed' } : t
        ),
      };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, {
    weekly: [],
    badges: [],
    upcomingTasks: [],
  });

  const setWeekly = useCallback((data) => dispatch({ type: 'SET_WEEKLY', payload: data }), []);
  const setBadges = useCallback((data) => dispatch({ type: 'SET_BADGES', payload: data }), []);
  const setTasks = useCallback((data) => dispatch({ type: 'SET_TASKS', payload: data }), []);
  const completeTask = useCallback((id) => dispatch({ type: 'COMPLETE_TASK', payload: id }), []);

  return (
    <ProgressContext.Provider value={{ ...state, setWeekly, setBadges, setTasks, completeTask }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
