import { useState, useCallback, useRef } from 'react';
import { aiService } from '../services/ai.service';

/**
 * Hook que gestiona el estado del tutor IA en una lección.
 */
export function useAITutor() {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('greeting');
  const [isLoading, setIsLoading] = useState(false);
  const consecutiveCorrect = useRef(0);
  const consecutiveWrong = useRef(0);
  const startTime = useRef(Date.now());

  const fetchMessage = useCallback(async (context = {}) => {
    setIsLoading(true);
    try {
      const minutesInLesson = Math.floor((Date.now() - startTime.current) / 60000);
      const res = await aiService.getTutorMessage({
        consecutiveCorrect: consecutiveCorrect.current,
        consecutiveWrong: consecutiveWrong.current,
        minutesInLesson,
        ...context,
      });
      setMessage(res.message);
      setMessageType(res.type);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onCorrectAnswer = useCallback(() => {
    consecutiveCorrect.current += 1;
    consecutiveWrong.current = 0;
    if (consecutiveCorrect.current % 3 === 0) fetchMessage();
  }, [fetchMessage]);

  const onWrongAnswer = useCallback(() => {
    consecutiveWrong.current += 1;
    consecutiveCorrect.current = 0;
    if (consecutiveWrong.current >= 2) fetchMessage();
  }, [fetchMessage]);

  const initTutor = useCallback(() => {
    startTime.current = Date.now();
    fetchMessage();
  }, [fetchMessage]);

  return {
    message,
    messageType,
    isLoading,
    initTutor,
    onCorrectAnswer,
    onWrongAnswer,
    fetchMessage,
  };
}
