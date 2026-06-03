import { useEffect } from 'react';
import { useDiagnostic } from '../../hooks/useDiagnostic';
import { Button } from '../../components/common/Button';
import { LEARNING_STYLES } from '../../constants/learningStyles';
import styles from './DiagnosticPage.module.css';
import { RadarVAK } from '../../components/charts/RadarVAK';

export function DiagnosticPage() {
  const {
    loadQuestions,
    currentQuestion,
    currentIndex,
    questions,
    answerQuestion,
    result,
    isLoading,
    progress,
    isDone,
    goToDashboard,
  } = useDiagnostic();

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  if (isLoading && !currentQuestion && !isDone) {
    return (
      <div className={styles.page}>
        <div className={styles.loading} aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <p>Preparando tu diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (isDone && result) {
    return <DiagnosticResult result={result} onContinue={goToDashboard} />;
  }

  if (!currentQuestion) return null;

  return (
    <div className={styles.page}>
      {/* Barra de progreso superior */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.step} aria-live="polite">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemax={questions.length}
            aria-label="Progreso del diagnóstico"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className={styles.stepPercent}>
            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
      </header>

      {/* Pregunta */}
      <main className={styles.questionArea} key={currentIndex}>
        <h1 className={styles.question}>{currentQuestion.question}</h1>
        <div className={styles.options}>
          {currentQuestion.options.map((opt) => {
            const styleInfo = LEARNING_STYLES[opt.style];
            return (
              <button
                key={opt.style}
                className={styles.optionCard}
                onClick={() => answerQuestion(opt.style)}
                aria-label={opt.label}
              >
                <div
                  className={styles.optionIcon}
                  style={{ background: styleInfo.bg, color: styleInfo.color }}
                >
                  <i className={`fa-solid ${opt.icon}`} aria-hidden="true" />
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                </div>
                <div className={styles.optionArrow}>
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function DiagnosticResult({ result, onContinue }) {
  const primaryStyle = LEARNING_STYLES[result.profile];
  const secondaryStyle = LEARNING_STYLES[result.secondary];

  const radarData = [
    { subject: 'Visual', A: result.scores.visual * 10, fullMark: 100 },
    { subject: 'Auditivo', A: result.scores.auditory * 10, fullMark: 100 },
    { subject: 'Kinestésico', A: result.scores.kinesthetic * 10, fullMark: 100 },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.resultContainer}>
        <div
          className={styles.resultBadge}
          style={{ background: primaryStyle.bg, color: primaryStyle.color }}
        >
          <i className={`fa-solid ${primaryStyle.icon}`} aria-hidden="true" />
          <span>Tu perfil de aprendizaje</span>
        </div>
        <h1 className={styles.resultTitle}>
          Eres principalmente{' '}
          <span style={{ color: primaryStyle.color }}>{primaryStyle.label}</span>
        </h1>
        <p className={styles.resultDesc}>{primaryStyle.description}</p>

        <div className={styles.resultSecondary}>
          <span>Estilo secundario:</span>
          <strong style={{ color: secondaryStyle.color }}>
            <i className={`fa-solid ${secondaryStyle.icon}`} aria-hidden="true" />{' '}
            {secondaryStyle.label}
          </strong>
        </div>

        {/* Gráfico radar */}
        <div className={styles.radar}>
          <RadarVAK data={radarData} />
        </div>

        {/* Tips personalizados */}
        <div className={styles.tips}>
          <h2 className={styles.tipsTitle}>
            <i className="fa-solid fa-lightbulb" aria-hidden="true" /> Estrategias para ti
          </h2>
          <ul className={styles.tipsList}>
            {primaryStyle.tips.map((tip) => (
              <li key={tip} className={styles.tip}>
                <i
                  className="fa-solid fa-check"
                  aria-hidden="true"
                  style={{ color: primaryStyle.color }}
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon="fa-arrow-right"
          iconPosition="right"
          onClick={onContinue}
        >
          Ir a mi dashboard personalizado
        </Button>
      </div>
    </div>
  );
}
