import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { THEMES, FONT_SIZES } from '../../constants/config';
import styles from './TeacherSettingsPage.module.css';

const THEME_OPTIONS = [
  { value: THEMES.LIGHT, icon: 'fa-sun', label: 'Claro' },
  { value: THEMES.DARK, icon: 'fa-moon', label: 'Oscuro' },
  { value: THEMES.DYSLEXIA, icon: 'fa-font', label: 'Dislexia' },
  { value: THEMES.HIGH_CONTRAST, icon: 'fa-circle-half-stroke', label: 'Alto contraste' },
];

const FONT_OPTIONS = [
  { value: FONT_SIZES.SMALL, label: 'Pequeño', sample: '14px' },
  { value: FONT_SIZES.NORMAL, label: 'Normal', sample: '16px' },
  { value: FONT_SIZES.LARGE, label: 'Grande', sample: '18px' },
  { value: FONT_SIZES.XLARGE, label: 'Muy grande', sample: '20px' },
];

export function TeacherSettingsPage() {
  const { user } = useUser();
  const { theme, fontSize, reducedMotion, setTheme, setFontSize, toggleReducedMotion } = useTheme();

  // Configuraciones específicas del docente
  const [inactivityDays, setInactivityDays] = useState(
    parseInt(localStorage.getItem('teacher_setting_inactivity_days') || '5', 10)
  );
  const [quizThreshold, setQuizThreshold] = useState(
    parseInt(localStorage.getItem('teacher_setting_quiz_threshold') || '70', 10)
  );
  const [streakWarning, setStreakWarning] = useState(
    localStorage.getItem('teacher_setting_streak_warning') !== 'false'
  );
  
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    localStorage.getItem('teacher_setting_ai_prompt') || 
    'Tono motivador, redactar de forma clara y directa, enfocado en el canal de aprendizaje del estudiante.'
  );

  const [aiModel, setAiModel] = useState(
    localStorage.getItem('teacher_setting_ai_model') || 'gemini-2.0-flash'
  );

  const handleSaveTeacherSettings = () => {
    localStorage.setItem('teacher_setting_inactivity_days', inactivityDays.toString());
    localStorage.setItem('teacher_setting_quiz_threshold', quizThreshold.toString());
    localStorage.setItem('teacher_setting_streak_warning', streakWarning.toString());
    localStorage.setItem('teacher_setting_ai_prompt', aiSystemPrompt);
    localStorage.setItem('teacher_setting_ai_model', aiModel);
    
    // Simular guardado exitoso
    const event = new CustomEvent('show-toast', {
      detail: { type: 'success', message: 'Configuraciones docentes guardadas con éxito.' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>Personaliza tu entorno de enseñanza y herramientas de IA</p>
      </header>

      {/* Perfil Docente */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-user-tie" aria-hidden="true" /> Perfil Docente
        </h2>
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            <span>{user?.name?.charAt(0)}</span>
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user?.name}</p>
            <p className={styles.profileEmail}>{user?.email}</p>
            <p className={styles.profileUniversity}>
              {user?.university} · Departamento de Ciencias
            </p>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Badge variant="primary" size="sm" icon="fa-chalkboard-user">
                Docente Activo
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Alertas Predictivas */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Parámetros de Alertas de Estudiantes
        </h2>
        <p className={styles.description}>
          Define los límites que utiliza nuestro motor heurístico para detectar estudiantes con riesgo académico o de deserción.
        </p>

        <div className={styles.settingRow}>
          <div className={styles.settingCol}>
            <label htmlFor="inactivity-input" className={styles.inputLabel}>Inactividad del Estudiante</label>
            <p className={styles.inputDesc}>Alertar si un estudiante no ingresa al curso por más de:</p>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="inactivity-input"
              type="number"
              min="1"
              max="30"
              value={inactivityDays}
              onChange={(e) => setInactivityDays(Math.max(1, parseInt(e.target.value) || 1))}
              className={styles.numInput}
            />
            <span className={styles.inputUnit}>días</span>
          </div>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingCol}>
            <label htmlFor="quiz-input" className={styles.inputLabel}>Bajo Desempeño en Quices</label>
            <p className={styles.inputDesc}>Alertar si el promedio de quices del estudiante cae por debajo de:</p>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="quiz-input"
              type="number"
              min="50"
              max="95"
              value={quizThreshold}
              onChange={(e) => setQuizThreshold(Math.max(10, Math.min(100, parseInt(e.target.value) || 10)))}
              className={styles.numInput}
            />
            <span className={styles.inputUnit}>%</span>
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div>
            <p className={styles.toggleLabel}>Pérdida de racha de estudio</p>
            <p className={styles.toggleDesc}>
              Generar alertas cuando estudiantes con excelente racha pierdan su regularidad.
            </p>
          </div>
          <button
            className={[styles.toggle, streakWarning ? styles.toggleOn : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setStreakWarning(!streakWarning)}
            role="switch"
            aria-checked={streakWarning}
            aria-label="Alertar por pérdida de racha"
          >
            <div className={styles.toggleThumb} />
          </button>
        </div>
      </Card>

      {/* Configuración de IA */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-robot" aria-hidden="true" /> Asistente de IA (EduAI Docente)
        </h2>
        <p className={styles.description}>
          Optimiza la generación automática de plantillas para tus intervenciones académicas.
        </p>

        <div className={styles.settingGroup}>
          <label htmlFor="model-select" className={styles.groupTitle}>Modelo de Lenguaje Predeterminado</label>
          <select
            id="model-select"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className={styles.selectInput}
          >
            <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recomendado - Veloz)</option>
            <option value="gemini-2.0-pro">Google Gemini 2.0 Pro (Máxima precisión conceptual)</option>
            <option value="local-heuristic">Motor Heurístico Local (Sin conexión)</option>
          </select>
        </div>

        <div className={styles.settingGroup}>
          <label htmlFor="prompt-textarea" className={styles.groupTitle}>Instrucciones de Redacción (System Prompt)</label>
          <p className={styles.inputDesc}>Guía el tono y estilo con el que el Asistente IA formula tus mensajes:</p>
          <textarea
            id="prompt-textarea"
            value={aiSystemPrompt}
            onChange={(e) => setAiSystemPrompt(e.target.value)}
            className={styles.textareaInput}
            rows={3}
            placeholder="Ej: Escribir con un tono empático pero formal. Invitar a tutorías personalizadas..."
          />
        </div>
      </Card>

      {/* Accesibilidad (Compartido) */}
      <Card padding="md">
        <h2 className={styles.sectionTitle}>
          <i className="fa-solid fa-universal-access" aria-hidden="true" /> Accesibilidad del Sistema
        </h2>

        <div className={styles.settingGroup}>
          <h3 className={styles.groupTitle}>Tema visual</h3>
          <div className={styles.themeOptions}>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                className={[styles.themeOption, theme === t.value ? styles.themeSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setTheme(t.value)}
                aria-pressed={theme === t.value}
              >
                <i className={`fa-solid ${t.icon}`} aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <h3 className={styles.groupTitle}>Tamaño de fuente</h3>
          <div className={styles.fontOptions}>
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                className={[styles.fontOption, fontSize === f.value ? styles.fontSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFontSize(f.value)}
                aria-pressed={fontSize === f.value}
              >
                <span style={{ fontSize: f.sample }}>A</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toggleRow} style={{ borderBottom: 'none' }}>
          <div>
            <p className={styles.toggleLabel}>Reducir movimiento</p>
            <p className={styles.toggleDesc}>
              Desactiva animaciones y transiciones de la interfaz para tu comodidad visual
            </p>
          </div>
          <button
            className={[styles.toggle, reducedMotion ? styles.toggleOn : '']
              .filter(Boolean)
              .join(' ')}
            onClick={toggleReducedMotion}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Reducir movimiento"
          >
            <div className={styles.toggleThumb} />
          </button>
        </div>
      </Card>

      {/* Botón Guardar */}
      <div className={styles.actionRow}>
        <Button variant="primary" icon="fa-floppy-disk" onClick={handleSaveTeacherSettings}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
