import { useEffect, useState } from 'react';
import { teacherService } from '../../services/teacher.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/feedback/Skeleton';
import { riskLabel } from '../../utils/riskCalculator';
import { formatPercent, formatRelativeDate } from '../../utils/formatters';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNotifications } from '../../context/NotificationContext';
import styles from './TeacherDashboardPage.module.css';

const generateMessageTemplate = (type, studentName, vakStyle) => {
  const firstName = studentName ? studentName.split(' ')[0] : 'Estudiante';

  if (type === 'tutor') {
    switch (vakStyle) {
      case 'visual':
        return `Hola ${firstName}, he estado revisando tu progreso y me gustaría invitarte a una tutoría de acompañamiento. He preparado una infografía y un mapa conceptual del material del curso que nos ayudarán a repasar las dudas que tengas de forma muy gráfica. ¿Qué te parece si nos reunimos esta semana?`;
      case 'auditory':
        return `Hola ${firstName}, ¿cómo estás? He estado siguiendo tu desempeño y me gustaría que tengamos una breve sesión de tutoría por videollamada para conversar sobre cómo te va con los temas y aclarar verbalmente cualquier duda. Cuéntame qué día de esta semana tienes disponible.`;
      case 'kinesthetic':
        return `Hola ${firstName}, te escribo porque me gustaría programar una sesión práctica de tutoría. Resolveremos juntos algunos ejercicios y simulaciones paso a paso para consolidar los conceptos. Cuéntame si te queda bien reunirnos este miércoles o jueves.`;
      default:
        return `Hola ${firstName}, espero que te encuentres muy bien. Te escribo con la intención de programar una tutoría de seguimiento académico y acompañarte en los temas que se te dificulten. Quedo atento a tu disponibilidad de horario esta semana.`;
    }
  } else if (type === 'motivation') {
    switch (vakStyle) {
      case 'visual':
        return `¡Hola ${firstName}! Quería felicitarte por el empeño que estás poniendo en la plataforma. Te sugiero revisar las presentaciones visuales y diagramas resumen del módulo actual para reforzar tus conocimientos. ¡Vas por excelente camino, sigue adelante!`;
      case 'auditory':
        return `¡Hola ${firstName}! Espero que estés muy bien. Me alegra mucho ver tu participación activa. Recuerda que explicar en voz alta los temas o escuchar los audios explicativos del curso es ideal para tu estilo. ¡Sigue con esa gran energía!`;
      case 'kinesthetic':
        return `¡Hola ${firstName}! Te felicito por tu gran dedicación en las actividades. Como aprendes haciendo, te recomiendo seguir probando con los quizzes interactivos y simulaciones prácticas de cada lección. ¡Excelente trabajo, continúa así!`;
      default:
        return `¡Hola ${firstName}! Te escribo para enviararte un mensaje de ánimo y felicitarte por tus esfuerzos en la plataforma. ¡Sigue adelante, cada paso cuenta!`;
    }
  } else {
    // type === 'alert' (Ausencia / Riesgo)
    switch (vakStyle) {
      case 'visual':
        return `Estimado ${firstName}, he notado que llevas varios días sin acceder a la plataforma. He diseñado una guía visual compacta del próximo módulo que te puede ayudar a retomar el ritmo fácilmente. Por favor, ingresa para que puedas revisarla. Si tienes dudas, estoy aquí para ayudarte.`;
      case 'auditory':
        return `Estimado ${firstName}, me he percatado de tu ausencia en la plataforma. Si tienes dificultades, me gustaría que me envíes un mensaje de voz o nos reunamos a conversar para ver cómo podemos ayudarte a avanzar con las lecciones. Espero saber de ti pronto.`;
      case 'kinesthetic':
        return `Estimado ${firstName}, he observado que has estado alejado de las lecciones prácticas en la plataforma. Te propongo que ingreses hoy y realices el siguiente taller interactivo corto para retomar el ritmo sin presiones. Estoy disponible para apoyarte.`;
      default:
        return `Estimado ${firstName}, he notado que has tenido poca actividad académica recientemente. Te invito a retomar tus estudios en la plataforma. Si necesitas cualquier apoyo, no dudes en escribirme.`;
    }
  }
};

const RISK_VARIANT = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };
const PIE_COLORS = [
  'var(--color-vak-visual)',
  'var(--color-vak-auditory)',
  'var(--color-vak-kinesthetic)',
];

export function TeacherDashboardPage() {
  const { addToast } = useNotifications();
  const [students, setStudents] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filtros y buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [vakFilter, setVakFilter] = useState('all');

  // Modal de intervención rápida
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [messageType, setMessageType] = useState('motivation');
  const [customMessage, setCustomMessage] = useState('');

  const handleOpenIntervention = (alert) => {
    const student = students.find((s) => s.id === alert.studentId);
    setSelectedAlert({
      ...alert,
      studentProfile: student,
    });
    setMessageType('motivation');
    setCustomMessage(
      generateMessageTemplate('motivation', alert.studentName, student?.cognitiveProfile?.primary)
    );
  };

  const handleSendIntervention = async () => {
    try {
      await teacherService.intervene(selectedAlert.id, selectedAlert.studentId, customMessage);
      addToast({
        type: 'success',
        message: `Intervención enviada con éxito a ${selectedAlert.studentName}.`,
      });

      // Remover la alerta de la lista
      setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));

      // Decrementar el KPI de alertas activas
      setKpis((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeAlerts: Math.max(0, prev.activeAlerts - 1),
        };
      });

      setSelectedAlert(null);
    } catch (err) {
      addToast({
        type: 'danger',
        message: `Error al enviar la intervención: ${err.message}`,
      });
    }
  };

  // Lógica de filtrado de estudiantes
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.risk?.level === riskFilter;
    const matchesVak = vakFilter === 'all' || s.cognitiveProfile?.primary === vakFilter;
    return matchesSearch && matchesRisk && matchesVak;
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      teacherService.getStudents(),
      teacherService.getKPIs(),
      teacherService.getVAKDistribution(),
      teacherService.getAlerts(),
    ])
      .then(([s, k, d, a]) => {
        setStudents(s);
        setKpis(k);
        setDistribution(d);
        setAlerts(a);
      })
      .catch((err) => {
        console.error('[TeacherDashboard] Error cargando datos:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const KPI_CARDS = kpis
    ? [
        {
          icon: 'fa-users',
          label: 'Estudiantes',
          value: kpis.totalStudents,
          color: 'var(--color-brand-primary)',
        },
        {
          icon: 'fa-triangle-exclamation',
          label: 'En riesgo',
          value: `${kpis.atRiskCount} (${kpis.atRiskPercent}%)`,
          color: 'var(--color-danger)',
        },
        {
          icon: 'fa-chart-line',
          label: 'Progreso promedio',
          value: formatPercent(kpis.avgProgress),
          color: 'var(--color-brand-secondary)',
        },
        {
          icon: 'fa-bell',
          label: 'Alertas activas',
          value: kpis.activeAlerts,
          color: 'var(--color-warning)',
        },
      ]
    : [];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Panel del Docente</h1>
          <p className={styles.subtitle}>Monitoreo en tiempo real de tu clase</p>
        </div>
        <Badge variant="primary" icon="fa-wand-magic-sparkles" size="md">
          Análisis IA activo
        </Badge>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="100px" borderRadius="xl" />
            ))
          : KPI_CARDS.map((k) => (
              <Card key={k.label} padding="md" className={styles.kpiCard}>
                <div
                  className={styles.kpiIcon}
                  style={{ background: k.color + '20', color: k.color }}
                >
                  <i className={`fa-solid ${k.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <p className={styles.kpiValue}>{k.value}</p>
                  <p className={styles.kpiLabel}>{k.label}</p>
                </div>
              </Card>
            ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Tabla de estudiantes */}
        <Card padding="none" className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.cardTitle}>Seguimiento de estudiantes</h2>
            {!isLoading && (
              <Badge variant="primary" size="sm">
                {filteredStudents.length} estudiantes
              </Badge>
            )}
          </div>

          {/* Barra de filtros y búsqueda */}
          <div className={styles.filtersBar}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchInputContainer}>
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o carrera..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Buscar estudiante"
                />
              </div>
            </div>
            <div className={styles.selectsWrapper}>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className={styles.filterSelect}
                aria-label="Filtrar por riesgo de deserción"
              >
                <option value="all">Todos los riesgos</option>
                <option value="low">Riesgo Bajo</option>
                <option value="medium">Riesgo Medio</option>
                <option value="high">Riesgo Alto</option>
              </select>
              <select
                value={vakFilter}
                onChange={(e) => setVakFilter(e.target.value)}
                className={styles.filterSelect}
                aria-label="Filtrar por estilo cognitivo"
              >
                <option value="all">Todos los estilos (VAK)</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditivo</option>
                <option value="kinesthetic">Kinestésico</option>
              </select>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table} aria-label="Tabla de seguimiento de estudiantes">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Perfil VAK</th>
                  <th>Progreso</th>
                  <th>Último acceso</th>
                  <th>Riesgo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6}>
                        <Skeleton height="44px" />
                      </td>
                    </tr>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyTable}>
                      No se encontraron estudiantes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const riskVar = RISK_VARIANT[s.risk?.level] || 'risk-low';
                    const styleInfo = s.cognitiveProfile
                      ? LEARNING_STYLES[s.cognitiveProfile.primary]
                      : null;
                    return (
                      <tr
                        key={s.id}
                        className={styles.tableRow}
                        onClick={() => setSelectedStudent(s)}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedStudent(s)}
                      >
                        <td>
                          <div className={styles.studentCell}>
                            <Avatar name={s.name} size="sm" />
                            <div>
                              <p className={styles.studentName}>{s.name}</p>
                              <p className={styles.studentProgram}>{s.program}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {styleInfo && (
                            <Badge
                              variant={s.cognitiveProfile.primary}
                              icon={styleInfo.icon}
                              size="sm"
                            >
                              {styleInfo.label}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className={styles.progressCell}>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{ width: `${s.stats.avgQuizScore * 100}%` }}
                              />
                            </div>
                            <span>{Math.round(s.stats.avgQuizScore * 100)}%</span>
                          </div>
                        </td>
                        <td className={styles.secondaryCell}>
                          {s.stats.daysSinceLastLogin === 0
                            ? 'Hoy'
                            : `Hace ${s.stats.daysSinceLastLogin} días`}
                        </td>
                        <td>
                          <Badge variant={riskVar} size="sm">
                            {riskLabel(s.risk?.level)}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(s);
                            }}
                          >
                            Ver detalle
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          {/* Distribución VAK */}
          <Card padding="md">
            <h3 className={styles.cardTitle}>Distribución VAK en clase</h3>
            {isLoading ? (
              <Skeleton height="200px" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {distribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v, 'Estudiantes']}
                      contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.distList}>
                  {distribution.map((d, i) => (
                    <div key={d.name} className={styles.distItem}>
                      <div className={styles.distColor} style={{ background: PIE_COLORS[i] }} />
                      <span className={styles.distStyle}>{d.name}</span>
                      <span className={styles.distVal}>
                        {d.count} ({d.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Alertas */}
          <Card padding="md">
            <h3 className={styles.cardTitle}>Alertas predictivas</h3>
            <div className={styles.alerts}>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} height="100px" />)
              ) : alerts.length === 0 ? (
                <p className={styles.emptyAlerts}>No hay alertas activas en este momento.</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={[styles.alertItem, styles[alert.priority]].join(' ')}
                  >
                    <div className={styles.alertContent}>
                      <i
                        className={`fa-solid ${alert.priority === 'high' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className={styles.alertMsg}>{alert.message}</p>
                        <p className={styles.alertAction}>
                          <strong>Acción:</strong> {alert.action}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={alert.priority === 'high' ? 'danger' : 'warning'}
                      size="sm"
                      className={styles.alertBtn}
                      onClick={() => handleOpenIntervention(alert)}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> Tomar
                      acción
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal estudiante */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Perfil: ${selectedStudent.name}`}
          size="md"
        >
          <div className={styles.studentModal}>
            <div className={styles.modalHeader}>
              <Avatar name={selectedStudent.name} size="xl" />
              <div>
                <h3 className={styles.modalName}>{selectedStudent.name}</h3>
                <p className={styles.modalProgram}>
                  {selectedStudent.program} · Semestre {selectedStudent.semester}
                </p>
                {selectedStudent.cognitiveProfile && (
                  <Badge
                    variant={selectedStudent.cognitiveProfile.primary}
                    icon={LEARNING_STYLES[selectedStudent.cognitiveProfile.primary]?.icon}
                    size="md"
                  >
                    {LEARNING_STYLES[selectedStudent.cognitiveProfile.primary]?.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className={styles.modalStats}>
              {[
                { label: 'Días sin acceso', value: selectedStudent.stats.daysSinceLastLogin },
                {
                  label: 'Lecciones esta semana',
                  value: selectedStudent.stats.completedLessonsThisWeek,
                },
                {
                  label: 'Promedio quizzes',
                  value: `${Math.round(selectedStudent.stats.avgQuizScore * 100)}%`,
                },
                { label: 'Racha actual', value: `${selectedStudent.stats.streak} días` },
              ].map((s) => (
                <div key={s.label} className={styles.modalStat}>
                  <p className={styles.modalStatVal}>{s.value}</p>
                  <p className={styles.modalStatLabel}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className={styles.modalRisk}>
              <Badge variant={RISK_VARIANT[selectedStudent.risk?.level]} size="md">
                Riesgo de deserción: {riskLabel(selectedStudent.risk?.level)}
              </Badge>
              {selectedStudent.risk?.factors?.length > 0 && (
                <div className={styles.riskFactors}>
                  <p className={styles.riskFactorsTitle}>Factores de riesgo:</p>
                  {selectedStudent.risk.factors.map((f) => (
                    <Badge key={f} variant="default" size="sm">
                      {f.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Intervención IA */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Intervención IA: ${selectedAlert.studentName}`}
          size="md"
        >
          <div className={styles.interventionModal}>
            <div className={styles.interventionHeader}>
              <div
                className={styles.alertIndicator}
                style={{
                  background:
                    selectedAlert.priority === 'high'
                      ? 'var(--color-danger-bg)'
                      : 'var(--color-warning-bg)',
                }}
              >
                <i
                  className={`fa-solid ${selectedAlert.priority === 'high' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}
                  style={{
                    color:
                      selectedAlert.priority === 'high'
                        ? 'var(--color-danger)'
                        : 'var(--color-warning)',
                  }}
                />
              </div>
              <div>
                <p className={styles.interventionSubtitle}>Recomendación para riesgo académico</p>
                <p className={styles.interventionSug}>
                  <strong>Sugerencia:</strong> {selectedAlert.action}
                </p>
              </div>
            </div>

            <div className={styles.studentBadgeRow}>
              <span>Estilo VAK:</span>
              {selectedAlert.studentProfile?.cognitiveProfile?.primary ? (
                <Badge
                  variant={selectedAlert.studentProfile.cognitiveProfile.primary}
                  icon={
                    LEARNING_STYLES[selectedAlert.studentProfile.cognitiveProfile.primary]?.icon
                  }
                  size="sm"
                >
                  {LEARNING_STYLES[selectedAlert.studentProfile.cognitiveProfile.primary]?.label}
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  No clasificado
                </Badge>
              )}
            </div>

            <div className={styles.templateSelection}>
              <p className={styles.sectionLabel}>Selecciona el enfoque del mensaje:</p>
              <div className={styles.templateOptions}>
                {[
                  { value: 'motivation', label: 'Motivación', icon: 'fa-wand-magic-sparkles' },
                  { value: 'tutor', label: 'Tutoría', icon: 'fa-calendar-days' },
                  { value: 'alert', label: 'Alerta', icon: 'fa-circle-exclamation' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={[
                      styles.templateOption,
                      messageType === t.value ? styles.templateSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setMessageType(t.value);
                      setCustomMessage(
                        generateMessageTemplate(
                          t.value,
                          selectedAlert.studentName,
                          selectedAlert.studentProfile?.cognitiveProfile?.primary
                        )
                      );
                    }}
                  >
                    <i className={`fa-solid ${t.icon}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.messageBox}>
              <label htmlFor="message-text" className={styles.sectionLabel}>
                <i
                  className="fa-solid fa-wand-magic-sparkles"
                  style={{ color: 'var(--color-brand-primary)', marginRight: 'var(--space-1)' }}
                />
                Mensaje personalizado (Adaptado por IA):
              </label>
              <textarea
                id="message-text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={styles.messageTextarea}
                rows={5}
              />
              <p className={styles.messageHint}>
                El tono de este mensaje ha sido optimizado automáticamente para el canal de
                aprendizaje preferido del estudiante. Puedes editar el texto antes de enviarlo.
              </p>
            </div>

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setSelectedAlert(null)}>
                Cancelar
              </Button>
              <Button variant="primary" icon="fa-paper-plane" onClick={handleSendIntervention}>
                Enviar intervención
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
