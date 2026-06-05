import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { useUser } from '../../context/UserContext';
import { useAITutor } from '../../hooks/useAITutor';
import { useAdaptiveContent } from '../../hooks/useAdaptiveRoute';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/feedback/Skeleton';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { formatDuration } from '../../utils/formatters';
import { courseDetailPath } from '../../constants/routes';
import styles from './LessonPage.module.css';

// Mapeo de videos reales de educación por lección (todos verificados)
const LESSON_VIDEOS = {
  // Matemáticas Básicas (c_001)
  l_001: 'NybHckSEQBI', // Algebra Basics: What Is Algebra? - Math Antics
  l_002: 'PVoTRu3p6ug', // Algebra for Beginners | Basics of Algebra
  l_003: 'LwCRRUa8yTU', // College Algebra - Full Course
  l_004: 'WUvTyaaNkzM', // The Essence of Calculus - 3Blue1Brown
  l_005: 'MXV65i9g1Xg', // Basic Linear Functions - Math Antics
  l_006: 'F21S9Wpi0y8', // Basic Trigonometry
  l_007: 'mhd9FXYdf4s', // Trigonometry Concepts - Don't Memorize! Visualize!
  l_008: 'Jsiy4TxgIME', // Basic trigonometry | Khan Academy
  // Desarrollo Sostenible (c_002)
  l_009: 'zCRKvDyyHmI', // Circular Economy - Ellen MacArthur Foundation
  l_010: 'o08ykAqLOxk', // How We Can Make the World a Better Place by 2030 | TED
  l_011: '7V8oFI4GYMY', // What is sustainable development?
  l_012: 'pF72px2R3Hg', // Why I live a zero waste life | Lauren Singer | TEDxTeen
  l_013: 'zCRKvDyyHmI', // Circular Economy - Ellen MacArthur Foundation
  // Programación Inicial (c_003)
  l_014: 'ifo76VyrBYo', // Introduction to Computer Programming
  l_015: 'Lub5qOmY4JQ', // Diagramas de flujo y pseudocódigo
  l_016: 'Z1Yd7upQsXY', // Python Variables for Absolute Beginners
  l_017: '4XA9CKJJbr4', // Python Programming - IF ELSE (Automate the Boring Stuff)
  l_018: '9Os0o3wzS_I', // Python Tutorial: Functions
  // Comunicación Académica (c_004)
  l_019: 'eIho2S0ZahI', // How to Speak So That People Want to Listen | TED
  l_020: 'Unzc731iCUY', // How to Speak | MIT OpenCourseWare
  l_021: 'eIho2S0ZahI', // How to Speak So That People Want to Listen | TED
  // Cálculo Diferencial (c_005)
  l_022: '2ZzL4PS8EN0', // Introducción a los Límites - BlueDot
  l_023: 'riXcZT2ICjA', // Introduction to limits | Khan Academy
  // Economía Circular (c_006)
  l_024: 'zCRKvDyyHmI', // Circular Economy - Ellen MacArthur Foundation
  l_025: 'pF72px2R3Hg', // Why I live a zero waste life | Lauren Singer | TEDxTeen
};



export function LessonPage() {
  const { id, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { message: aiMsg, initTutor, onCorrectAnswer, onWrongAnswer, fetchMessage } = useAITutor();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Tareas PDF
  const [submissions, setSubmissions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingTask, setIsUploadingTask] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Estados del Reproductor Visual (YouTube)
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [isCineMode, setIsCineMode] = useState(false);

  // Estados del Reproductor Auditivo (TTS)
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const sentencesRef = useRef([]);
  const speechUtteranceRef = useRef(null);

  // Estados del Reto Kinestésico
  const [kinestheticSuccess, setKinestheticSuccess] = useState(false);

  // Estados para la Máquina de Funciones (Lección l_004)
  const [functionXInput, setFunctionXInput] = useState('');
  const [functionOutput, setFunctionOutput] = useState('?');
  const [isMachineProcessing, setIsMachineProcessing] = useState(false);
  const [machineMessage, setMachineMessage] = useState(
    'Ingresa un valor para X y observa cómo se transforma.'
  );

  // Estados para la Balanza de Ecuaciones (Lección l_001)
  const [balanceStep, setBalanceStep] = useState(1); // 1: Inicial, 2: Restado 4, 3: Dividido por 2 (Completado)
  const [leftX, setLeftX] = useState(2);
  const [leftOnes, setLeftOnes] = useState(4);
  const [rightOnes, setRightOnes] = useState(10);
  const [balanceAngle, setBalanceAngle] = useState(-15); // Negativo significa cargado a la derecha

  // Estados para reto de ordenamiento (Otras lecciones)
  const [orderedSteps, setOrderedSteps] = useState([]);
  const [stepOrderCorrect, setStepOrderCorrect] = useState(false);

  const adaptiveContent = useAdaptiveContent(lesson);
  const profile = user?.cognitiveProfile;
  const styleInfo = profile ? LEARNING_STYLES[profile.primary] : null;

  // Carga de lección
  useEffect(() => {
    setIsLoading(true);
    courseService
      .getLessonById(lessonId)
      .then((l) => {
        setLesson(l);
        initTutor();
        // Inicializar pasos desordenados para reto alternativo
        if (l && l.contentByStyle?.kinesthetic?.steps) {
          const steps = [...l.contentByStyle.kinesthetic.steps];
          // Mezclar pasos
          const shuffled = steps
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
          setOrderedSteps(shuffled);
        }
      })
      .finally(() => setIsLoading(false));

    // Cleanup Speech Synthesis
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [lessonId, initTutor]);

  // Disparador de inactividad de 45 segundos
  useEffect(() => {
    if (!lesson) return;

    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        fetchMessage({ inactive: true });
      }, 45000);
    };

    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [lesson, fetchMessage]);

  // Carga de entregas de tareas previas
  useEffect(() => {
    courseService.getSubmissions(lessonId).then((subs) => {
      setSubmissions(subs || []);
    }).catch(err => {
      console.error('Error cargando entregas:', err);
    });
  }, [lessonId]);

  // Preparar frases de transcripción al cargar la lección (Universal para TTS)
  useEffect(() => {
    if (adaptiveContent) {
      let textToRead = '';
      if (adaptiveContent.transcript) {
        textToRead = adaptiveContent.transcript;
      } else {
        textToRead = `${adaptiveContent.title || ''}. ${adaptiveContent.description || ''}`;
        if (adaptiveContent.steps && Array.isArray(adaptiveContent.steps)) {
          textToRead += `. Pasos prácticos a seguir: ${adaptiveContent.steps.join('. ')}`;
        }
      }

      // Dividir por puntos, excluyendo cadenas vacías
      const parsed = textToRead
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3);
      sentencesRef.current = parsed;
    }
  }, [adaptiveContent]);

  // Manejar finalización del quiz
  const handleQuizSubmit = async () => {
    setIsSubmitting(true);
    const answers = lesson.quiz.map((q, i) => quizAnswers[i] ?? -1);
    const result = await courseService.submitQuiz(lessonId, answers);
    setQuizResult(result);

    if (result.passed) {
      await progressService.recordQuizPassed(lessonId, result.score, id);
    }

    result.feedback.forEach((f) => {
      f.isCorrect ? onCorrectAnswer() : onWrongAnswer();
    });
    setIsSubmitting(false);
  };

  // --- LÓGICA DE AUDITIVO (SPEECH SYNTHESIS) ---
  const speakSentence = (index) => {
    window.speechSynthesis.cancel();
    if (index < 0 || index >= sentencesRef.current.length) {
      setIsSpeechPlaying(false);
      setCurrentSentenceIndex(-1);
      return;
    }

    setCurrentSentenceIndex(index);
    const text = sentencesRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = speechRate;

    utterance.onend = () => {
      // Avanzar automáticamente a la siguiente oración
      if (index + 1 < sentencesRef.current.length) {
        speakSentence(index + 1);
      } else {
        setIsSpeechPlaying(false);
        setCurrentSentenceIndex(-1);
      }
    };

    utterance.onerror = () => {
      setIsSpeechPlaying(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPauseSpeech = () => {
    if (isSpeechPlaying) {
      window.speechSynthesis.pause();
      setIsSpeechPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeechPlaying(true);
      } else {
        setIsSpeechPlaying(true);
        // Empezar desde el inicio o desde el índice actual
        speakSentence(currentSentenceIndex === -1 ? 0 : currentSentenceIndex);
      }
    }
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeechPlaying(false);
    setCurrentSentenceIndex(-1);
  };

  const handlePrevSentence = () => {
    const nextIdx = Math.max(0, currentSentenceIndex - 1);
    setIsSpeechPlaying(true);
    speakSentence(nextIdx);
  };

  const handleNextSentence = () => {
    const nextIdx = Math.min(sentencesRef.current.length - 1, currentSentenceIndex + 1);
    setIsSpeechPlaying(true);
    speakSentence(nextIdx);
  };

  const handleSpeechRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setSpeechRate(rate);
    if (isSpeechPlaying && currentSentenceIndex !== -1) {
      // Reiniciar la frase actual con el nuevo ritmo
      speakSentence(currentSentenceIndex);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('El archivo debe ser en formato PDF.');
        setSelectedFile(null);
      } else if (file.size > 5 * 1024 * 1024) {
        setUploadError('El tamaño del archivo no debe superar los 5MB.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setUploadError('');
      }
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploadingTask(true);
    setUploadError('');
    try {
      const newSub = await courseService.submitTask(lessonId, selectedFile);
      setSubmissions((prev) => [newSub, ...prev]);
      setSelectedFile(null);
    } catch (err) {
      setUploadError(err.message || 'Error al subir la tarea.');
    } finally {
      setIsUploadingTask(false);
    }
  };

  // --- LÓGICA DE KINESTÉSICO (SIMULADORES INTERACTIVOS) ---

  // Reto: Máquina de Funciones (l_004)
  const handleProcessMachine = () => {
    const xVal = parseFloat(functionXInput);
    if (isNaN(xVal)) {
      setMachineMessage('⚠️ Por favor ingresa un número válido en la entrada X.');
      return;
    }

    setIsMachineProcessing(true);
    setMachineMessage('⚙️ Procesando la entrada en la fórmula 2x + 3...');

    setTimeout(() => {
      const output = 2 * xVal + 3;
      setFunctionOutput(output);
      setIsMachineProcessing(false);

      if (output === 11) {
        setMachineMessage('🎉 ¡Excelente! f(4) = 2(4) + 3 = 11. ¡Has resuelto el reto matemático!');
        setKinestheticSuccess(true);
      } else {
        setMachineMessage(
          `💡 Entrada procesada: f(${xVal}) = 2(${xVal}) + 3 = ${output}. Recuerda que queremos obtener un resultado final de 11. ¡Prueba con otro número!`
        );
      }
    }, 1200);
  };

  // Reto: Balanza de Ecuaciones (l_001)
  const handleBalanceSubtract = () => {
    if (balanceStep === 1) {
      setLeftOnes(0);
      setRightOnes(6);
      setBalanceAngle(-8); // Aún algo pesado a la derecha porque hay 6 unidades vs 2X
      setBalanceStep(2);
    }
  };

  const handleBalanceDivide = () => {
    if (balanceStep === 2) {
      setLeftX(1);
      setRightOnes(3);
      setBalanceAngle(0); // Perfectamente equilibrado (X = 3)
      setBalanceStep(3);
      setKinestheticSuccess(true);
    }
  };

  const handleResetBalance = () => {
    setBalanceStep(1);
    setLeftX(2);
    setLeftOnes(4);
    setRightOnes(10);
    setBalanceAngle(-15);
    setKinestheticSuccess(false);
  };

  // Reto: Ordenamiento alternativo (Otras lecciones)
  const handleMoveStep = (index, direction) => {
    const newSteps = [...orderedSteps];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      // Intercambiar
      const temp = newSteps[index];
      newSteps[index] = newSteps[targetIndex];
      newSteps[targetIndex] = temp;
      setOrderedSteps(newSteps);
    }
  };

  const handleVerifyOrder = () => {
    const original = lesson.contentByStyle.kinesthetic.steps;
    const isCorrect = orderedSteps.every((step, i) => step === original[i]);
    if (isCorrect) {
      setStepOrderCorrect(true);
      setKinestheticSuccess(true);
    } else {
      setStepOrderCorrect(false);
      alert('❌ El orden no es el correcto. ¡Inténtalo de nuevo!');
    }
  };

  if (isLoading)
    return (
      <div className={styles.page}>
        <Skeleton height="40px" width="200px" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-6)',
          }}
        >
          <Skeleton height="400px" borderRadius="xl" />
          <Skeleton height="300px" borderRadius="xl" />
        </div>
      </div>
    );

  if (!lesson) return <p>Lección no encontrada.</p>;

  const videoId = LESSON_VIDEOS[lessonId] || 'R4N54u304O4';

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Navegación de migas">
        <button onClick={() => navigate(courseDetailPath(id))} className={styles.breadBtn}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver al curso
        </button>
        <span className={styles.breadSep}>/</span>
        <span className={styles.breadCurrent}>{lesson.title}</span>
      </nav>

      {/* Modo cine para el video */}
      {isCineMode && profile?.primary === 'visual' && (
        <div className={styles.videoWrapperCine}>
          <button className={styles.exitCineBtn} onClick={() => setIsCineMode(false)}>
            <i className="fa-solid fa-expand" /> Salir de Modo Cine
          </button>
          <iframe
            className={styles.videoIframeCine}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
            title={adaptiveContent.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className={styles.layout}>
        {/* Contenido principal */}
        <main className={styles.main}>
          <div className={styles.lessonHeader}>
            <div>
              <h1 className={styles.lessonTitle}>{lesson.title}</h1>
              <div className={styles.lessonMeta}>
                {styleInfo && (
                  <Badge variant={profile.primary} icon={styleInfo.icon}>
                    Adaptado: {styleInfo.label}
                  </Badge>
                )}
                <span className={styles.duration}>
                  <i className="fa-solid fa-clock" aria-hidden="true" />{' '}
                  {formatDuration(lesson.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Contenido adaptativo */}
          {adaptiveContent && (
            <Card padding="lg" className={styles.contentCard}>
              <div className={styles.contentHeaderRow}>
                <h2 className={styles.contentTitle}>{adaptiveContent.title}</h2>
                {profile?.primary !== 'auditory' && sentencesRef.current.length > 0 && (
                  <button
                    onClick={handlePlayPauseSpeech}
                    className={`${styles.generalTtsBtn} ${isSpeechPlaying ? styles.generalTtsBtnActive : ''}`}
                    title={isSpeechPlaying ? 'Pausar narración' : 'Escuchar lección en voz alta'}
                    aria-label="Escuchar lección en voz alta"
                  >
                    <i className={`fa-solid ${isSpeechPlaying ? 'fa-volume-high fa-beat' : 'fa-volume-low'}`} />
                    <span>{isSpeechPlaying ? ' Pausar' : ' Escuchar'}</span>
                  </button>
                )}
              </div>
              <p className={styles.contentDesc}>{adaptiveContent.description}</p>

              {/* Visual: video real */}
              {profile?.primary === 'visual' && (
                <div className={styles.videoPlayer}>
                  <div className={styles.videoWrapper}>
                    <iframe
                      className={styles.videoIframe}
                      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                      title={adaptiveContent.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className={styles.videoControls}>
                    <div className={styles.videoControlsLeft}>
                      <span className={styles.duration}>
                        <i className="fa-solid fa-circle-play" /> Video Educativo
                      </span>
                    </div>
                    <button className={styles.cineBtn} onClick={() => setIsCineMode(true)}>
                      <i className="fa-solid fa-expand" /> Modo Cine
                    </button>
                  </div>
                </div>
              )}

              {/* Auditivo: audio real con Web Speech API */}
              {profile?.primary === 'auditory' && (
                <div className={styles.audioPlayer}>
                  <div
                    className={`${styles.audioWave} ${isSpeechPlaying ? styles.audioWaveActive : ''}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={styles.audioBar}
                        style={{
                          animationDelay: `${i * 50}ms`,
                          height: isSpeechPlaying
                            ? `${12 + Math.abs(Math.sin(i * 0.7)) * 28}px`
                            : '15px',
                        }}
                      />
                    ))}
                  </div>

                  <div className={styles.audioControls}>
                    <button
                      onClick={handlePrevSentence}
                      disabled={currentSentenceIndex <= 0}
                      title="Frase anterior"
                    >
                      <i className="fa-solid fa-backward-step" />
                    </button>
                    <button
                      onClick={handlePlayPauseSpeech}
                      className={styles.playBtnAudio}
                      title={isSpeechPlaying ? 'Pausar narración' : 'Escuchar lección'}
                    >
                      <i className={`fa-solid ${isSpeechPlaying ? 'fa-pause' : 'fa-play'}`} />
                    </button>
                    <button
                      onClick={handleStopSpeech}
                      disabled={currentSentenceIndex === -1}
                      title="Detener narración"
                    >
                      <i className="fa-solid fa-stop" />
                    </button>
                    <button
                      onClick={handleNextSentence}
                      disabled={currentSentenceIndex >= sentencesRef.current.length - 1}
                      title="Siguiente frase"
                    >
                      <i className="fa-solid fa-forward-step" />
                    </button>
                  </div>

                  <div className={styles.audioSettings}>
                    <label htmlFor="speech-rate-select">Velocidad:</label>
                    <select
                      id="speech-rate-select"
                      className={styles.audioSpeed}
                      value={speechRate}
                      onChange={handleSpeechRateChange}
                    >
                      <option value="0.8">Lento (0.8x)</option>
                      <option value="1">Normal (1.0x)</option>
                      <option value="1.2">Rápido (1.2x)</option>
                      <option value="1.5">Muy Rápido (1.5x)</option>
                    </select>
                  </div>

                  {adaptiveContent.transcript && (
                    <details className={styles.transcript} open>
                      <summary>Transcripción interactiva (Sincronizada)</summary>
                      <p>
                        {sentencesRef.current.map((sentence, idx) => (
                          <span
                            key={idx}
                            className={idx === currentSentenceIndex ? styles.sentenceHighlight : ''}
                            style={{ transition: 'background-color 0.3s ease' }}
                          >
                            {sentence}.{' '}
                          </span>
                        ))}
                      </p>
                    </details>
                  )}
                </div>
              )}

              {/* Kinestésico: Retos matemáticos e interactivos funcionales */}
              {profile?.primary === 'kinesthetic' && (
                <div className={styles.interactiveSteps}>
                  <h3 className={styles.stepsTitle}>Reto Práctico del Estudiante:</h3>

                  {/* CASO 1: Concepto de Función (l_004) */}
                  {lessonId === 'l_004' && (
                    <div
                      className={`${styles.simulatorContainer} ${kinestheticSuccess ? styles.simulatorContainerSuccess : ''}`}
                    >
                      <div className={styles.simHeader}>
                        <div className={styles.simTitle}>
                          <i className="fa-solid fa-gears" /> Máquina de Funciones Interactiva
                        </div>
                        <span className={styles.simBadge}>REGLA: f(x) = 2x + 3</span>
                      </div>

                      <div className={styles.functionMachine}>
                        <div className={styles.machineVisual}>
                          <div
                            className={`${styles.inputPipe} ${functionXInput ? styles.inputPipeActive : ''}`}
                          >
                            <span className={styles.pipeLabel}>Entrada (x)</span>
                            <div className={styles.pipeVal}>{functionXInput || '?'}</div>
                          </div>

                          <div
                            className={`${styles.machineBody} ${isMachineProcessing ? styles.machineBodyActive : ''}`}
                          >
                            <div className={styles.machineFormula}>f(x) = 2x + 3</div>
                            <i
                              className={`fa-solid fa-cog ${styles.machineCog}`}
                              style={{
                                animationPlayState: isMachineProcessing ? 'running' : 'paused',
                              }}
                            />
                          </div>

                          <div
                            className={`${styles.outputPipe} ${functionOutput !== '?' ? styles.outputPipeActive : ''}`}
                          >
                            <span className={styles.pipeLabel}>Salida f(x)</span>
                            <div className={styles.pipeVal}>{functionOutput}</div>
                          </div>
                        </div>

                        <div className={styles.machineControls}>
                          <div className={styles.targetPrompt}>
                            🎯 <strong>Objetivo:</strong> Consigue que la máquina entregue una
                            salida de <strong>11</strong>.
                          </div>

                          <div className={styles.inputGroup}>
                            <input
                              type="number"
                              placeholder="Ingresa valor de x"
                              value={functionXInput}
                              onChange={(e) => setFunctionXInput(e.target.value)}
                              disabled={isMachineProcessing || kinestheticSuccess}
                            />
                            <Button
                              variant="vak-kinesthetic"
                              onClick={handleProcessMachine}
                              isLoading={isMachineProcessing}
                              disabled={!functionXInput || kinestheticSuccess}
                            >
                              Procesar x
                            </Button>
                          </div>

                          <p
                            className={styles.contentDesc}
                            style={{ textAlign: 'center', fontSize: '12px' }}
                          >
                            {machineMessage}
                          </p>
                        </div>
                      </div>

                      {kinestheticSuccess && (
                        <div className={styles.successOverlay}>
                          <div className={styles.successIcon}>
                            <i className="fa-solid fa-check" />
                          </div>
                          <h4>¡Reto Superado!</h4>
                          <p>
                            Has deducido que f(4) = 2(4) + 3 = 11. Se ha desbloqueado el Quiz Final.
                          </p>
                          <button
                            className={styles.resetBtn}
                            onClick={() => {
                              setFunctionXInput('');
                              setFunctionOutput('?');
                              setKinestheticSuccess(false);
                              setMachineMessage(
                                'Ingresa un valor para X y observa cómo se transforma.'
                              );
                            }}
                          >
                            Reiniciar Reto
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASO 2: Introducción al Álgebra (l_001) */}
                  {lessonId === 'l_001' && (
                    <div
                      className={`${styles.simulatorContainer} ${kinestheticSuccess ? styles.simulatorContainerSuccess : ''}`}
                    >
                      <div className={styles.simHeader}>
                        <div className={styles.simTitle}>
                          <i className="fa-solid fa-scale-balanced" /> Balanza de Ecuaciones
                        </div>
                        <span className={styles.simBadge}>Resolver: 2x + 4 = 10</span>
                      </div>

                      <div className={styles.balanceSimulator}>
                        <div className={styles.balanceVisual}>
                          {/* El beam (brazo) oscila según el ángulo */}
                          <div
                            className={styles.balanceBeam}
                            style={{ transform: `rotate(${balanceAngle}deg)` }}
                          >
                            {/* Platillo izquierdo */}
                            <div
                              className={`${styles.balancePan} ${styles.panLeft}`}
                              style={{ transform: `rotate(${-balanceAngle}deg)` }}
                            >
                              <div className={styles.panContent}>
                                {Array.from({ length: leftX }).map((_, i) => (
                                  <div key={`x-${i}`} className={styles.blockX}>
                                    X
                                  </div>
                                ))}
                                {Array.from({ length: leftOnes }).map((_, i) => (
                                  <div key={`one-${i}`} className={styles.blockOne}>
                                    1
                                  </div>
                                ))}
                              </div>
                              <div className={styles.panPlate} />
                            </div>

                            {/* Platillo derecho */}
                            <div
                              className={`${styles.balancePan} ${styles.panRight}`}
                              style={{ transform: `rotate(${-balanceAngle}deg)` }}
                            >
                              <div className={styles.panContent}>
                                {Array.from({ length: rightOnes }).map((_, i) => (
                                  <div key={`r-${i}`} className={styles.blockOne}>
                                    1
                                  </div>
                                ))}
                              </div>
                              <div className={styles.panPlate} />
                            </div>
                          </div>
                          <div className={styles.balanceFulcrum} />
                          <div className={styles.balanceBase} />
                        </div>

                        <div className={styles.equationLabels}>
                          <div className={styles.sideLabel}>
                            {leftX > 0 ? `${leftX}X` : ''}{' '}
                            {leftOnes > 0 ? `+ ${leftOnes}` : leftX === 0 ? '0' : ''}
                          </div>
                          <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>=</div>
                          <div className={styles.sideLabel}>{rightOnes}</div>
                        </div>

                        <div className={styles.balanceControls}>
                          {balanceStep === 1 && (
                            <>
                              <div className={styles.stepGoal}>
                                <strong>Paso 1:</strong> Necesitas dejar las variables solas en la
                                izquierda. Restemos 4 unidades de ambos lados.
                              </div>
                              <div className={styles.controlRow}>
                                <Button variant="vak-kinesthetic" onClick={handleBalanceSubtract}>
                                  Restar 4 a ambos lados
                                </Button>
                              </div>
                            </>
                          )}

                          {balanceStep === 2 && (
                            <>
                              <div className={styles.stepGoal}>
                                <strong>Paso 2:</strong> Ahora tienes 2X = 6. Divide ambos lados
                                entre 2 para despejar X.
                              </div>
                              <div className={styles.controlRow}>
                                <Button variant="vak-kinesthetic" onClick={handleBalanceDivide}>
                                  Dividir entre 2 a ambos lados
                                </Button>
                              </div>
                            </>
                          )}

                          {balanceStep === 3 && (
                            <div className={styles.stepGoal}>
                              🎉 ¡Ecuación balanceada! <strong>X = 3</strong>. ¡Has completado con
                              éxito la lección práctica!
                            </div>
                          )}
                        </div>
                      </div>

                      {kinestheticSuccess && (
                        <div className={styles.successOverlay}>
                          <div className={styles.successIcon}>
                            <i className="fa-solid fa-check" />
                          </div>
                          <h4>¡Ecuación Equilibrada con Éxito!</h4>
                          <p>
                            Has resuelto el reto de la balanza para obtener X = 3. Se ha
                            desbloqueado el Quiz Final.
                          </p>
                          <button className={styles.resetBtn} onClick={handleResetBalance}>
                            Reiniciar Balanza
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASO 3: Reto de Ordenamiento Alternativo (Otras lecciones l_002, l_003, l_009) */}
                  {lessonId !== 'l_001' && lessonId !== 'l_004' && (
                    <div
                      className={`${styles.simulatorContainer} ${kinestheticSuccess ? styles.simulatorContainerSuccess : ''}`}
                    >
                      <div className={styles.simHeader}>
                        <div className={styles.simTitle}>
                          <i className="fa-solid fa-list-check" /> Reto de Secuencia Lógica
                        </div>
                        <span className={styles.simBadge}>Ordena los pasos</span>
                      </div>

                      <p
                        className={styles.contentDesc}
                        style={{ fontSize: '13px', margin: '0 0 var(--space-2)' }}
                      >
                        Organiza los conceptos/pasos de la lección en la secuencia correcta de
                        ejecución para desbloquear el quiz final.
                      </p>

                      <div className={styles.stepsList}>
                        {orderedSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className={styles.step}
                            style={{
                              background: 'var(--color-surface)',
                              padding: 'var(--space-2) var(--space-3)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                              }}
                            >
                              <span
                                className={styles.stepNum}
                                style={{
                                  background: 'var(--color-vak-kinesthetic)',
                                  color: 'white',
                                  width: '22px',
                                  height: '22px',
                                  fontSize: '11px',
                                }}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className={styles.stepText}
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {step}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <button
                                onClick={() => handleMoveStep(idx, -1)}
                                disabled={idx === 0 || kinestheticSuccess}
                                style={{
                                  background: 'none',
                                  border: '1px solid var(--color-border)',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                }}
                              >
                                🔼
                              </button>
                              <button
                                onClick={() => handleMoveStep(idx, 1)}
                                disabled={idx === orderedSteps.length - 1 || kinestheticSuccess}
                                style={{
                                  background: 'none',
                                  border: '1px solid var(--color-border)',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                }}
                              >
                                🔽
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!kinestheticSuccess && (
                        <Button
                          variant="vak-kinesthetic"
                          onClick={handleVerifyOrder}
                          style={{ alignSelf: 'center', marginTop: 'var(--space-2)' }}
                        >
                          Validar Orden de Secuencia
                        </Button>
                      )}

                      {kinestheticSuccess && (
                        <div className={styles.successOverlay}>
                          <div className={styles.successIcon}>
                            <i className="fa-solid fa-check" />
                          </div>
                          <h4>¡Secuencia Ordenada!</h4>
                          <p>
                            Has organizado los pasos en la secuencia metodológica correcta. Se ha
                            desbloqueado el Quiz Final.
                          </p>
                          <button
                            className={styles.resetBtn}
                            onClick={() => {
                              setKinestheticSuccess(false);
                              setStepOrderCorrect(false);
                            }}
                          >
                            Reiniciar Reto
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.stepsList}>
                    {adaptiveContent.steps &&
                      adaptiveContent.steps.map((step, i) => (
                        <div key={step} className={styles.step}>
                          <span
                            className={styles.stepNum}
                            style={{ background: 'var(--color-vak-kinesthetic)', color: '#fff' }}
                          >
                            {i + 1}
                          </span>
                          <span className={styles.stepText}>{step}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Módulo de Subida de Tareas PDF */}
          <Card padding="md" className={styles.submissionCard}>
            <h3 className={styles.submissionCardTitle}>
              <i className="fa-solid fa-file-arrow-up" /> Entrega de Tarea Académica (PDF)
            </h3>
            <p className={styles.submissionCardDesc}>
              Sube tu documento de resolución en formato PDF. Nuestro Tutor de IA evaluará tu trabajo al instante con retroalimentación personalizada.
            </p>

            {submissions.length > 0 ? (
              <div className={styles.submissionsList}>
                {submissions.map((sub) => (
                  <div key={sub.id} className={styles.subItem}>
                    <div className={styles.subHeader}>
                      <div className={styles.subFileInfo}>
                        <i className="fa-solid fa-file-pdf text-danger" style={{ color: 'var(--color-vak-auditory)', marginRight: 'var(--space-2)' }} />
                        <a href={`http://localhost:3001${sub.filePath}`} target="_blank" rel="noopener noreferrer" className={styles.subFileName}>
                          {sub.fileName}
                        </a>
                      </div>
                      <span className={`${styles.subScoreBadge} ${sub.score >= 3.0 ? styles.scorePass : styles.scoreFail}`}>
                        Nota: {sub.score.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className={styles.subFeedback}>
                      <strong>Evaluación IA ({profile?.primary ? profile.primary.toUpperCase() : 'General'}):</strong>
                      <p className={styles.feedbackText}>{sub.feedback}</p>
                    </div>
                    <span className={styles.subDate}>
                      Entregado el: {new Date(sub.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptySubmissions}>
                <i className="fa-solid fa-folder-open" />
                <p>No has realizado ninguna entrega para esta lección.</p>
              </div>
            )}

            <form onSubmit={handleTaskSubmit} className={styles.uploadForm}>
              <div className={styles.fileInputWrapper}>
                <input
                  type="file"
                  id="task-file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploadingTask}
                  className={styles.fileInputHidden}
                />
                <label htmlFor="task-file-input" className={styles.fileInputLabel}>
                  <i className="fa-solid fa-cloud-arrow-up" />
                  {selectedFile ? (
                    <span className={styles.selectedFileName}>{selectedFile.name}</span>
                  ) : (
                    <span>Seleccionar o arrastrar archivo PDF (Máx. 5MB)</span>
                  )}
                </label>
              </div>
              {uploadError && <p className={styles.uploadErrorMsg}>{uploadError}</p>}
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedFile || isUploadingTask}
                isLoading={isUploadingTask}
                icon="fa-paper-plane"
              >
                Subir y Calificar con IA
              </Button>
            </form>
          </Card>

          {/* Quiz */}
          {!quizStarted ? (
            <Card padding="md" className={styles.quizPrompt}>
              <div className={styles.quizPromptContent}>
                <div className={styles.quizIcon}>
                  <i className="fa-solid fa-clipboard-question" aria-hidden="true" />
                </div>
                <div>
                  <h3>¿Listo para el quiz?</h3>
                  <p>
                    {lesson.quiz.length} preguntas · Necesitas 60% para aprobar
                    {profile?.primary === 'kinesthetic' && !kinestheticSuccess && (
                      <span
                        style={{
                          color: 'var(--color-danger)',
                          display: 'block',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          marginTop: '4px',
                        }}
                      >
                        ⚠️ Debes completar el reto práctico interactivo arriba para desbloquear el
                        quiz.
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setQuizStarted(true)}
                  icon="fa-arrow-right"
                  disabled={profile?.primary === 'kinesthetic' && !kinestheticSuccess}
                >
                  Iniciar quiz
                </Button>
              </div>
            </Card>
          ) : quizResult ? (
            <QuizResult
              result={quizResult}
              quiz={lesson.quiz}
              onNext={() => navigate(courseDetailPath(id))}
            />
          ) : (
            <Card padding="md" className={styles.quiz}>
              <h2 className={styles.quizTitle}>Quiz de verificación</h2>
              {lesson.quiz.map((q, qi) => (
                <div key={q.id} className={styles.question}>
                  <p className={styles.questionText}>
                    {qi + 1}. {q.question}
                  </p>
                  <div className={styles.options}>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={[
                          styles.option,
                          quizAnswers[qi] === oi ? styles.optionSelected : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setQuizAnswers((a) => ({ ...a, [qi]: oi }))}
                        aria-pressed={quizAnswers[qi] === oi}
                      >
                        <span className={styles.optLetter}>{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                variant="primary"
                fullWidth
                onClick={handleQuizSubmit}
                isLoading={isSubmitting}
                disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
              >
                Enviar respuestas
              </Button>
            </Card>
          )}
        </main>

        {/* Panel tutor IA */}
        <aside className={styles.tutorPanel}>
          <Card padding="md" className={styles.tutorCard}>
            <div className={styles.tutorHeader}>
              <div className={styles.tutorAvatar}>
                <i className="fa-solid fa-robot" aria-hidden="true" />
              </div>
              <div>
                <p className={styles.tutorName}>Tutor IA</p>
                <p className={styles.tutorSub}>En vivo contigo</p>
              </div>
              <div className={styles.liveIndicator}>
                <span>EN VIVO</span>
              </div>
            </div>
            {aiMsg ? (
              <div className={styles.tutorMsg}>
                <i className="fa-solid fa-quote-left" aria-hidden="true" />
                <p>{aiMsg}</p>
              </div>
            ) : (
              <Skeleton height="80px" />
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function QuizResult({ result, quiz, onNext }) {
  return (
    <Card padding="md" className={styles.quizResult}>
      <div className={styles.resultHeader}>
        <div
          className={styles.resultIcon}
          style={{
            background: result.passed ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
          }}
        >
          <i
            className={`fa-solid ${result.passed ? 'fa-trophy' : 'fa-rotate-right'}`}
            style={{ color: result.passed ? 'var(--color-success)' : 'var(--color-danger)' }}
            aria-hidden="true"
          />
        </div>
        <div>
          <h3 className={styles.resultTitle}>{result.passed ? '¡Aprobaste!' : 'Casi lo logras'}</h3>
          <p className={styles.resultScore}>
            {result.correct}/{result.total} correctas · {Math.round(result.score * 100)}%
          </p>
        </div>
      </div>
      <div className={styles.feedback}>
        {result.feedback.map((f, i) => (
          <div
            key={i}
            className={[styles.feedItem, f.isCorrect ? styles.correct : styles.incorrect].join(' ')}
          >
            <i className={`fa-solid ${f.isCorrect ? 'fa-check' : 'fa-xmark'}`} aria-hidden="true" />
            <p>{quiz[i]?.question}</p>
            {!f.isCorrect && <p className={styles.explanation}>{f.explanation}</p>}
          </div>
        ))}
      </div>
      <Button
        variant="primary"
        fullWidth
        onClick={onNext}
        icon="fa-arrow-right"
        iconPosition="right"
      >
        {result.passed ? 'Siguiente lección' : 'Revisar contenido'}
      </Button>
    </Card>
  );
}
