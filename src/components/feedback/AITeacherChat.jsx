import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { aiService } from '../../services/ai.service';
import styles from './AITutorChat.module.css';

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

  // Listas con viñetas: - o * al inicio de la línea
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

export function AITeacherChat({ isOpen, onClose, onOpen }) {
  const { user } = useUser();
  const [localOpen, setLocalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasNewMessageAlert, setHasNewMessageAlert] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('edu_gemini_api_key') || '');
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeOpen = isOpen !== undefined ? isOpen : localOpen;

  // Cargar historial de chat o saludo inicial
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      setIsThinking(true);
      try {
        const history = await aiService.getChatHistory(
          { primary: 'visual' }, // perfil cognitivo ficticio para mantener firma
          'teacher_assistant' // id especial para el chat del docente
        );

        if (history && history.length > 0) {
          const parsedHistory = history.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(parsedHistory);
        } else {
          const welcomeText = `¡Hola, Prof. **${user?.name || 'docente'}**! Soy **EduAI**, tu Asistente de IA. 

Estoy aquí para facilitarte las tareas pedagógicas y de gestión de tus cursos. Puedo ayudarte a:
- Diseñar y estructurar nuevas lecciones.
- Redactar anuncios motivacionales para tus alumnos.
- Diseñar preguntas evaluativas (quices) y mini-retos.
- Proponer ideas para motivar a estudiantes con bajo rendimiento.

¿Con qué tarea te gustaría que empecemos hoy?`;

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
        console.error('Error al cargar historial del asistente:', error);
      } finally {
        setIsThinking(false);
      }
    };

    loadChatHistory();
  }, [user]);

  // Al abrir el chat, quitar la alerta de nuevo mensaje y hacer scroll
  useEffect(() => {
    if (activeOpen) {
      setHasNewMessageAlert(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [activeOpen]);

  // Escuchar evento global para abrir el chat
  useEffect(() => {
    const handleOpen = () => {
      if (onOpen) onOpen();
      else setLocalOpen(true);
    };
    window.addEventListener('open-ai-teacher', handleOpen);
    return () => window.removeEventListener('open-ai-teacher', handleOpen);
  }, [onOpen]);

  // Hacer scroll automático al recibir o enviar mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleToggle = () => {
    if (activeOpen) {
      if (onClose) onClose();
      else setLocalOpen(false);
    } else {
      if (onOpen) onOpen();
      else setLocalOpen(true);
    }
  };

  // Reconocimiento de voz (STT)
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
    recognition.lang = 'es-CO'; // Español Colombiano
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

    const studentMessage = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sender: 'student',
      timestamp: new Date(),
    };

    const currentHistory = [...messages, studentMessage];
    setMessages((prev) => [...prev, studentMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Consultar al servicio de IA pasando 'teacher_assistant' para RAG contextual de profesor
      const tutorResponse = await aiService.getChatResponse(
        messageText,
        { primary: 'visual' }, // Perfil dummy
        currentHistory,
        'teacher_assistant'
      );

      const tutorMessage = {
        id: `msg_${Date.now() + 1}`,
        text: tutorResponse,
        sender: 'tutor',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, tutorMessage]);
      if (!activeOpen) {
        setHasNewMessageAlert(true);
      }
    } catch (error) {
      console.error('Error al obtener respuesta del asistente:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickPrompts = [
    { text: 'Revisar alertas de estudiantes', icon: 'fa-triangle-exclamation' },
    { text: 'Redactar un anuncio de clase', icon: 'fa-bullhorn' },
    { text: 'Diseñar preguntas para un quiz', icon: 'fa-lightbulb' },
  ];

  const hasKeyConfigured = !!localStorage.getItem('edu_gemini_api_key');

  return (
    <div className={`${styles.chatWrapper} ${styles.teacher}`}>
      {/* Burbuja Flotante */}
      <button
        className={`${styles.chatBubble} ${activeOpen ? styles.bubbleActive : ''}`}
        onClick={handleToggle}
        aria-label="Abrir chat del Asistente de IA"
      >
        <span className={styles.bubbleIcon}>
          <i className="fa-solid fa-graduation-cap" />
        </span>
        {hasNewMessageAlert && <span className={styles.alertBadge} />}
      </button>

      {/* Ventana de Chat */}
      <div className={`${styles.chatWindow} ${activeOpen ? styles.windowOpen : ''}`}>
        {/* Cabecera */}
        <div className={styles.chatHeader}>
          <div className={styles.tutorInfo}>
            <div className={styles.avatarWrap}>
              <i className="fa-solid fa-graduation-cap" />
              <span className={styles.statusDot} />
            </div>
            <div>
              <h4 className={styles.tutorName}>EduAI · Asistente Docente</h4>
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
            <button
              className={styles.closeBtn}
              onClick={handleToggle}
              aria-label="Cerrar chat"
            >
              <i className="fa-solid fa-xmark" />
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
            </a>
            .
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
                      text: '✨ ¡Excelente! Has conectado tu Gemini API Key de forma exitosa. Ahora me comunicaré contigo utilizando Inteligencia Artificial real adaptada para asistirte en tus labores de enseñanza. ¿Qué deseas preguntarme hoy?',
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
                      text: 'ℹ️ Has desconectado tu Gemini API Key. He activado de nuevo mi motor heurístico local de respaldo para docentes. Podrás volver a conectarla en cualquier momento pulsando el botón 🔑.',
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
                      <i className="fa-solid fa-graduation-cap" />
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
                  <i className="fa-solid fa-graduation-cap" />
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
            placeholder="Pídemelo aquí (anuncios, quices, lecciones...)"
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
      </div>
    </div>
  );
}
