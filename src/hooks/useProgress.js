import { useState, useCallback } from 'react';
import { progressService } from '../services/progress.service';
import { useUser } from '../context/UserContext';

export function useProgressData() {
  const { user } = useUser();
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [vakRadar, setVakRadar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [w, m, b, a, t, cp, vak] = await Promise.all([
        progressService.getWeeklyProgress(user.id),
        progressService.getMonthlyProgress(user.id),
        progressService.getBadges(user.id),
        progressService.getRecentActivities(user.id),
        progressService.getUpcomingTasks(user.id),
        progressService.getCourseProgress(user.id),
        progressService.getVAKRadar(user.id),
      ]);
      setWeekly(w);
      setMonthly(m);
      setBadges(b);
      setActivities(a);
      setTasks(t);
      setCourseProgress(cp);
      setVakRadar(vak);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const toggleTask = useCallback(async (taskId) => {
    try {
      const updatedTasks = await progressService.toggleTaskStatus(taskId);
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  }, []);

  return {
    weekly,
    monthly,
    badges,
    activities,
    tasks,
    courseProgress,
    vakRadar,
    isLoading,
    loadAll,
    toggleTask,
  };
}
