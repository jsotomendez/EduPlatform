import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { api } from '../utils/api';

const UserContext = createContext(null);

const initialState = {
  user: storage.get('user', null),
  isAuthenticated: !!storage.get('user', null),
  isLoading: false,
  error: null,
};

function userReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState, user: null, isAuthenticated: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_COGNITIVE_PROFILE':
      return { ...state, user: { ...state.user, cognitiveProfile: action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Sincronizar el perfil del usuario con el servidor al cargar la aplicación
  const syncUser = useCallback(async () => {
    const token = localStorage.getItem('edu_token');
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const userData = await api.get('/api/auth/me');
      storage.set('user', userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    } catch (err) {
      console.error('Error al sincronizar el perfil del usuario:', err);
      // Si el token es inválido o expirado, limpiar la sesión
      if (err.message?.includes('token') || err.message?.includes('Token') || err.message?.includes('autorizado')) {
        storage.remove('user');
        localStorage.removeItem('edu_token');
        dispatch({ type: 'LOGOUT' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback((userData) => {
    storage.set('user', userData);
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
  }, []);

  const logout = useCallback(() => {
    storage.remove('user');
    storage.remove('diagnostic');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback(
    async (data) => {
      // Actualización local rápida
      const updated = { ...state.user, ...data };
      storage.set('user', updated);
      dispatch({ type: 'UPDATE_PROFILE', payload: data });

      // Sincronización en segundo plano con el servidor
      try {
        await api.post('/api/auth/profile', data);
      } catch (err) {
        console.error('Error al sincronizar perfil con el servidor:', err);
      }
    },
    [state.user]
  );

  const setCognitiveProfile = useCallback(
    async (profile) => {
      // Actualización local rápida
      const updated = { ...state.user, cognitiveProfile: profile };
      storage.set('user', updated);
      dispatch({ type: 'SET_COGNITIVE_PROFILE', payload: profile });

      // Sincronización en segundo plano con el servidor
      try {
        await api.post('/api/auth/profile', { cognitiveProfile: profile });
      } catch (err) {
        console.error('Error al sincronizar perfil cognitivo con el servidor:', err);
      }
    },
    [state.user]
  );

  const setLoading = useCallback((val) => dispatch({ type: 'SET_LOADING', payload: val }), []);
  const setError = useCallback((err) => dispatch({ type: 'SET_ERROR', payload: err }), []);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  return (
    <UserContext.Provider
      value={{ ...state, login, logout, updateProfile, setCognitiveProfile, setLoading, setError }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
