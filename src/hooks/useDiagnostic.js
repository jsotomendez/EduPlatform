import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticService } from '../services/diagnostic.service';
import { progressService } from '../services/progress.service';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { ROUTES } from '../constants/routes';

export function useDiagnostic() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setCognitiveProfile } = useUser();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const qs = await diagnosticService.getQuestions();
      setQuestions(qs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const answerQuestion = useCallback(
    (style) => {
      const question = questions[currentIndex];
      const newAnswers = [...answers, { questionId: question.id, style }];
      setAnswers(newAnswers);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        submitDiagnostic(newAnswers);
      }
    },
    [currentIndex, questions, answers]
  );

  const submitDiagnostic = useCallback(
    async (finalAnswers) => {
      setIsLoading(true);
      try {
        const res = await diagnosticService.submitAnswers(finalAnswers);
        setResult(res);
        setCognitiveProfile({
          primary: res.profile,
          secondary: res.secondary,
          scores: res.scores,
          diagnosedAt: res.diagnosedAt,
        });
        await progressService.recordDiagnosticCompleted(res.scores);
        addToast({
          type: 'success',
          message: '¡Diagnóstico completado! Conocemos tu perfil cognitivo.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setCognitiveProfile, addToast]
  );

  const goToDashboard = useCallback(() => {
    navigate(ROUTES.STUDENT_DASHBOARD);
  }, [navigate]);

  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
  const isDone = result !== null;

  return {
    questions,
    currentIndex,
    answers,
    result,
    isLoading,
    loadQuestions,
    answerQuestion,
    goToDashboard,
    progress,
    isDone,
    currentQuestion: questions[currentIndex] || null,
  };
}
