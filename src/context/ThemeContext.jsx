import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { THEMES, FONT_SIZES } from '../constants/config';

const ThemeContext = createContext(null);

const savedPrefs = storage.get('theme_prefs', {});
const initialState = {
  theme: savedPrefs.theme || THEMES.LIGHT,
  fontSize: savedPrefs.fontSize || FONT_SIZES.NORMAL,
  reducedMotion: savedPrefs.reducedMotion || false,
};

function themeReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FONT':
      return { ...state, fontSize: action.payload };
    case 'TOGGLE_MOTION':
      return { ...state, reducedMotion: !state.reducedMotion };
    case 'RESET':
      return { theme: THEMES.LIGHT, fontSize: FONT_SIZES.NORMAL, reducedMotion: false };
    default:
      return state;
  }
}

function applyTheme(state) {
  const body = document.body;
  body.classList.remove('theme-dark', 'theme-dyslexia', 'theme-high-contrast');
  if (state.theme !== THEMES.LIGHT) body.classList.add(`theme-${state.theme}`);

  body.classList.remove(
    'font-size-small',
    'font-size-normal',
    'font-size-large',
    'font-size-xlarge'
  );
  body.classList.add(`font-size-${state.fontSize}`);

  body.classList.toggle('reduce-motion', state.reducedMotion);
}

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    applyTheme(state);
    storage.set('theme_prefs', state);
  }, [state]);

  const setTheme = useCallback((theme) => dispatch({ type: 'SET_THEME', payload: theme }), []);
  const setFontSize = useCallback((size) => dispatch({ type: 'SET_FONT', payload: size }), []);
  const toggleReducedMotion = useCallback(() => dispatch({ type: 'TOGGLE_MOTION' }), []);
  const resetTheme = useCallback(() => dispatch({ type: 'RESET' }), []);

  const isDark = state.theme === THEMES.DARK;
  const isDyslexia = state.theme === THEMES.DYSLEXIA;
  const isHighContrast = state.theme === THEMES.HIGH_CONTRAST;

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        setTheme,
        setFontSize,
        toggleReducedMotion,
        resetTheme,
        isDark,
        isDyslexia,
        isHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
