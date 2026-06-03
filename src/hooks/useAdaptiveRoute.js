import { useMemo } from 'react';
import { useUser } from '../context/UserContext';

/**
 * Ordena los módulos de un curso según el perfil VAK del usuario.
 * El contenido del estilo dominante aparece primero, el secundario después.
 *
 * @param {object[]} modules
 * @returns {object[]}
 */
export function useAdaptiveRoute(modules = []) {
  const { user } = useUser();
  const profile = user?.cognitiveProfile;

  return useMemo(() => {
    if (!profile || !modules.length) return modules;

    return [...modules].sort((a, b) => {
      const aScore = getStyleScore(a, profile);
      const bScore = getStyleScore(b, profile);
      return bScore - aScore;
    });
  }, [modules, profile]);
}

function getStyleScore(module, profile) {
  if (!module.preferredStyle) return 0;
  if (module.preferredStyle === profile.primary) return 2;
  if (module.preferredStyle === profile.secondary) return 1;
  return 0;
}

/**
 * Devuelve el tipo de contenido preferido del usuario para una lección.
 * @param {object} lesson - lección con contentByStyle
 * @returns {object}
 */
export function useAdaptiveContent(lesson) {
  const { user } = useUser();
  const profile = user?.cognitiveProfile;

  return useMemo(() => {
    if (!lesson?.contentByStyle || !profile) return null;
    return (
      lesson.contentByStyle[profile.primary] ||
      lesson.contentByStyle[profile.secondary] ||
      Object.values(lesson.contentByStyle)[0]
    );
  }, [lesson, profile]);
}
