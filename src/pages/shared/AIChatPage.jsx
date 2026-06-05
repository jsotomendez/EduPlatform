import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { aiService } from '../../services/ai.service';
import { teacherService } from '../../services/teacher.service';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import styles from './AIChatPage.module.css';

// Función utilitaria para parsear markdown básico y formatear texto amigablemente en el chat
function renderMarkdown(text) {
  if (!text) return '';

  // Escapar caracteres básicos de HTML para prevenir inyección
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Formatear negrita: **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Formatear cursiva: *texto* o _texto_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Código en línea: `código`
  html = html.replace(/`(.*?)`/g, '<code class="chat-code">$1</code>');

  // Listas con viñetas: - o * o • al inicio de la línea
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bulletMatch) {
      let result = '';
      if (!inList) {
        inList = true;
        result += '<ul class="chat-list">';
      }
      result += `<li>${bulletMatch[2]}</li>`;
      return result;
    } else {
      let result = '';
      if (inList) {
        inList = false;
        result += '</ul>';
      }
      result += line;
      return result;
    }
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');

  // Reemplazar saltos de línea por <br />
  html = html.replace(/\n/g, '<br />');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function AIChatPage() {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('edu_gemini_api_key') || '');
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeLessonId = isTeacher ? 'teacher_assistant' : 'main_tutor';

  // Cargar alertas (si es profesor)
  useEffect(() => {
    if (isTeacher) {
      teacherService.getAlerts()
        .then(data => setAlerts(data || []))
        .catch(err => console.error('Error cargando alertas para el chat:', err));
    }
  }, [isTeacher]);

  // Cargar historial de chat o saludo inicial
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      setIsThinking(true);
      try {
        const history = await aiService.getChatHistory(
          user.cognitiveProfile || { primary: 'visual' },
          activeLessonId
        );

        if (history && history.length > 0) {
          const parsedHistory = history.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(parsedHistory);
        } else {
          // Saludo predeterminado
          let welcomeText = '';
          if (isTeacher) {
            welcomeText = `¡Hola, Prof. **${user?.name || 'docente'}**! Soy **EduAI**, tu Asistente de IA. 

Estoy a tu servicio para facilitarte la gestión pedagógica y de tus asignaturas. Puedo ayudarte con:
- 🚨 **Revisar alertas** y redactar intervenciones motivacionales para alumnos en riesgo.
- 📢 **Redactar anuncios** semanales o recordatorios para la cartelera.
- 📝 **Diseñar quices** o preguntas de evaluación con sus debidas explicaciones.
- 📚 **Estructurar planes de lección** o explicaciones didácticas.

¿Con cuál de estas actividades empezamos hoy?`;
          } else {
            const style = user?.cognitiveProfile?.primary || 'visual';
            if (style === 'visual') {
              welcomeText = `¡Hola, **${user?.name || 'estudiante'}**! Soy tu **Tutor IA**. 
              
Noto que tu estilo de aprendizaje principal es **Visual**. Hoy nos apoyaremos en diagramas conceptuales, analogías de colores y resúmenes estructurados en pasos lógicos. 
              
¿Qué tema de tus asignaturas te gustaría que representemos gráficamente hoy?`;
            } else if (style === 'auditory') {
              welcomeText = `¡Hola, **${user?.name || 'estudiante'}**! Soy tu **Tutor IA**. 
              
He estructurado explicaciones secuenciales y rítmicas para tu estilo de aprendizaje **Auditivo**. 
              
¿Qué lección o fórmula te gustaría que analicemos y discutamos paso a paso?`;
            } else {
              welcomeText = `¡Hola, **${user?.name || 'estudiante'}**! Soy tu **Tutor IA**. 
              
Veo que eres un estudiante **Kinestésico** (aprendes haciendo). He preparado mini-retos, analogías dinámicas y simulaciones interactivas rápidas. 
              
¿Con qué ejercicio o reto práctico empezamos el día de hoy?`;
            }
          }

          setMessages([
            {
              id: 'msg_init',
              text: welcomeText,
              sender: 'tutor',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error al cargar historial del chat de IA:', error);
      } finally {
        setIsThinking(false);
      }
    };

    loadChatHistory();
  }, [user, activeLessonId, isTeacher]);

  // Hacer scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Entrada por Voz (Speech To Text)
  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('La entrada por voz no está soportada en este navegador. Te recomendamos usar Google Chrome o Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (e) => {
      console.error('Error en el reconocimiento de voz:', e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sender: 'student',
      timestamp: new Date(),
    };

    const currentHistory = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await aiService.getChatResponse(
        messageText,
        user?.cognitiveProfile || { primary: 'visual' },
        currentHistory,
        activeLessonId
      );

      const aiReply = {
        id: `msg_${Date.now() + 1}`,
        text: response,
        sender: 'tutor',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error('Error al obtener respuesta del tutor:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleAlertClick = (alert) => {
    const promptText = `Revisar alertas: Ayúdame a diseñar una intervención académica para ${alert.studentName}. Alerta: ${alert.message}. Acción recomendada: ${alert.action}.`;
    handleSend(promptText);
  };

  // Prompts rápidos dinámicos según el rol
  const quickPrompts = isTeacher
    ? [
        { text: 'Revisar alertas de estudiantes', icon: 'fa-triangle-exclamation' },
        { text: 'Redactar un anuncio de clase', icon: 'fa-bullhorn' },
        { text: 'Diseñar preguntas para un quiz', icon: 'fa-lightbulb' },
      ]
    : [
        { text: '¡Dame un consejo de estudio!', icon: 'fa-lightbulb' },
        { text: '¿Cómo me preparo para el examen?', icon: 'fa-graduation-cap' },
        { text: 'No entiendo la lección de hoy', icon: 'fa-circle-question' },
      ];

  const profileStyle = !isTeacher && user?.cognitiveProfile?.primary ? user.cognitiveProfile.primary : 'visual';
  const hasKeyConfigured = !!localStorage.getItem('edu_gemini_api_key');

  const studentProfile = user?.cognitiveProfile;
  const styleInfo = studentProfile ? LEARNING_STYLES[studentProfile.primary] : null;

  return (
    <div className={`${styles.chatPage} ${styles[profileStyle]} ${isTeacher ? styles.teacherMode : ''}`}>
      
      {/* Contenedor del Doble Panel */}
      <div className={styles.container}>
        
        {/* PANEL IZQUIERDO: Widgets Contextuales */}
        <aside className={styles.sidebar}>
          {isTeacher ? (
            // Panel de Control del Docente
            <div className={styles.sidebarContent}>
              <div className={styles.sectionHeader}>
                <i className="fa-solid fa-bell-concierge" />
                <h3>Asistente de Aula</h3>
              </div>
              <p className={styles.sidebarIntro}>
                Aquí puedes gestionar tus materias e intervenir alertas estudiantiles haciendo un solo clic.
              </p>

              <div className={styles.widgetBox}>
                <h4 className={styles.widgetTitle}>🚨 Alertas Académicas Activas</h4>
                {alerts.length === 0 ? (
                  <div className={styles.emptyAlerts}>
                    <i className="fa-solid fa-circle-check" />
                    <p>No hay alertas activas de estudiantes.</p>
                  </div>
                ) : (
                  <div className={styles.alertsList}>
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`${styles.alertItem} ${styles[alert.priority]}`}>
                        <div className={styles.alertHeader}>
                          <span className={styles.studentName}>{alert.studentName}</span>
                          <span className={`${styles.priorityBadge} ${styles[alert.priority]}`}>
                            {alert.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className={styles.alertMessage}>{alert.message}</p>
                        <button 
                          className={styles.alertInterveneBtn}
                          onClick={() => handleAlertClick(alert)}
                          disabled={isThinking}
                        >
                          <i className="fa-solid fa-file-pen" /> Redactar Intervención
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.widgetBox}>
                <h4 className={styles.widgetTitle}>🛠️ Acciones Directas</h4>
                <div className={styles.actionsList}>
                  <button onClick={() => handleSend('Diseñar preguntas para un quiz')} className={styles.actionBtn}>
                    <i className="fa-solid fa-lightbulb" /> Crear Quiz
                  </button>
                  <button onClick={() => handleSend('Redactar un anuncio de clase')} className={styles.actionBtn}>
                    <i className="fa-solid fa-bullhorn" /> Crear Anuncio
                  </button>
                  <button onClick={() => handleSend('Propón una estructura para una nueva lección')} className={styles.actionBtn}>
                    <i className="fa-solid fa-book" /> Estructurar Lección
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Panel de Perfil del Estudiante
            <div className={styles.sidebarContent}>
              <div className={styles.sectionHeader}>
                <i className="fa-solid fa-user-gear" />
                <h3>Tu Perfil de Aprendizaje</h3>
              </div>
              
              {styleInfo && (
                <div className={styles.profileCard}>
                  <div className={styles.styleIconWrap} style={{ color: styleInfo.color, background: styleInfo.bg }}>
                    <i className={`fa-solid ${styleInfo.icon}`} />
                  </div>
                  <h4 className={styles.styleName}>Estilo {styleInfo.label}</h4>
                  <p className={styles.styleDescription}>{styleInfo.description}</p>
                </div>
              )}

              {studentProfile?.scores && (
                <div className={styles.widgetBox}>
                  <h4 className={styles.widgetTitle}>📊 Canales VAK (Puntuación)</h4>
                  <div className={styles.vakBarGroup}>
                    <div className={styles.vakLabel}>Visual ({studentProfile.scores.visual}/10)</div>
                    <div className={styles.vakBarOuter}>
                      <div className={`${styles.vakBarInner} ${styles.visual}`} style={{ width: `${studentProfile.scores.visual * 10}%` }} />
                    </div>
                  </div>
                  <div className={styles.vakBarGroup}>
                    <div className={styles.vakLabel}>Auditivo ({studentProfile.scores.auditory}/10)</div>
                    <div className={styles.vakBarOuter}>
                      <div className={`${styles.vakBarInner} ${styles.auditory}`} style={{ width: `${studentProfile.scores.auditory * 10}%` }} />
                    </div>
                  </div>
                  <div className={styles.vakBarGroup}>
                    <div className={styles.vakLabel}>Kinestésico ({studentProfile.scores.kinesthetic}/10)</div>
                    <div className={styles.vakBarOuter}>
                      <div className={`${styles.vakBarInner} ${styles.kinesthetic}`} style={{ width: `${studentProfile.scores.kinesthetic * 10}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {styleInfo?.tips && (
                <div className={styles.widgetBox}>
                  <h4 className={styles.widgetTitle}>💡 Consejos Recomendados</h4>
                  <ul className={styles.tipsList}>
                    {styleInfo.tips.map((tip, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-circle-check" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* PANEL DERECHO: Ventana de Chat Completa */}
        <section className={styles.chatWindow}>
          
          {/* Cabecera del Chat */}
          <div className={styles.chatHeader}>
            <div className={styles.tutorInfo}>
              <div className={styles.avatarWrap}>
                <i className={`fa-solid ${isTeacher ? 'fa-graduation-cap' : 'fa-robot'}`} />
                <span className={styles.statusDot} />
              </div>
              <div>
                <h4 className={styles.tutorName}>
                  {isTeacher ? 'EduAI · Asistente Docente' : 'EduAI · Tutor Adaptativo'}
                </h4>
                <p className={styles.tutorStatus}>
                  {hasKeyConfigured ? '⚡ Gemini 2.0 Flash Conectado' : 'En línea'}
                </p>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <button
                className={`${styles.keyConfigBtn} ${hasKeyConfigured ? styles.keyConnected : ''} ${
                  showKeyDrawer ? styles.drawerOpenActive : ''
                }`}
                onClick={() => setShowKeyDrawer(!showKeyDrawer)}
                title="Configurar Gemini API Key"
                aria-label="Configurar API Key"
              >
                <i className="fa-solid fa-key" />
              </button>
            </div>
          </div>

          {/* Cajón de Configuración de API Key */}
          <div className={`${styles.keyDrawer} ${showKeyDrawer ? styles.drawerOpen : ''}`}>
            <h5 className={styles.drawerTitle}>🔑 Conectar Inteligencia Artificial</h5>
            <p className={styles.drawerText}>
              Ingresa tu <strong>Gemini API Key</strong> para activar respuestas en tiempo real del
              modelo <strong>Gemini 2.0 Flash</strong> de Google. Consíguela gratis en{' '}
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>.
            </p>
            <div className={styles.drawerInputGroup}>
              <input
                type="password"
                className={styles.keyInput}
                placeholder="Ingresa tu API Key (AIzaSy...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className={styles.drawerActions}>
                <button
                  className={styles.saveKeyBtn}
                  onClick={() => {
                    if (apiKey.trim()) {
                      localStorage.setItem('edu_gemini_api_key', apiKey.trim());
                      setShowKeyDrawer(false);
                      const alertMsg = {
                        id: `key_alert_${Date.now()}`,
                        text: '✨ ¡Excelente! Has conectado tu Gemini API Key de forma exitosa. Ahora me comunicaré contigo utilizando Inteligencia Artificial real adaptada. ¿Qué deseas preguntarme hoy?',
                        sender: 'tutor',
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, alertMsg]);
                    }
                  }}
                  disabled={!apiKey.trim()}
                >
                  Guardar
                </button>
                {hasKeyConfigured && (
                  <button
                    className={styles.removeKeyBtn}
                    onClick={() => {
                      localStorage.removeItem('edu_gemini_api_key');
                      setApiKey('');
                      setShowKeyDrawer(false);
                      const alertMsg = {
                        id: `key_alert_${Date.now()}`,
                        text: 'ℹ️ Has desconectado tu Gemini API Key. He activado de nuevo mi motor local de respaldo. Podrás volver a conectarla en cualquier momento.',
                        sender: 'tutor',
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, alertMsg]);
                    }}
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className={styles.chatBody}>
            <div className={styles.messagesContainer}>
              {messages.map((msg) => {
                const isTutor = msg.sender === 'tutor';
                return (
                  <div
                    key={msg.id}
                    className={`${styles.messageRow} ${isTutor ? styles.tutorRow : styles.studentRow}`}
                  >
                    {isTutor && (
                      <div className={styles.msgAvatar}>
                        <i className={`fa-solid ${isTeacher ? 'fa-graduation-cap' : 'fa-robot'}`} />
                      </div>
                    )}
                    <div className={styles.messageBubble}>
                      <p className={styles.messageText}>{renderMarkdown(msg.text)}</p>
                      <span className={styles.messageTime}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Pensando... */}
              {isThinking && (
                <div className={`${styles.messageRow} ${styles.tutorRow}`}>
                  <div className={styles.msgAvatar}>
                    <i className={`fa-solid ${isTeacher ? 'fa-graduation-cap' : 'fa-robot'}`} />
                  </div>
                  <div className={`${styles.messageBubble} ${styles.thinkingBubble}`}>
                    <div className={styles.typingIndicator}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Prompts Rápidos */}
          <div className={styles.quickPrompts}>
            {quickPrompts.map((prompt, idx) => (
              <button key={idx} className={styles.promptBtn} onClick={() => handleSend(prompt.text)}>
                <i className={`fa-solid ${prompt.icon}`} />
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>

          {/* Input de Mensajes */}
          <div className={styles.chatFooter}>
            <button
              className={`${styles.micBtn} ${isListening ? styles.micListening : ''}`}
              onClick={handleMicClick}
              disabled={isThinking}
              title={isListening ? 'Escuchando... Haz clic para detener' : 'Dictar mensaje (Reconocimiento de voz)'}
              aria-label="Reconocimiento de voz"
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`} />
            </button>
            <input
              type="text"
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTeacher ? "Escribe tu instrucción (anuncio, quiz, lección...)" : "Escribe tu duda o consulta aquí..."}
              disabled={isThinking}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              aria-label="Enviar mensaje"
            >
              <i className="fa-solid fa-paper-plane" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
