import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdaptiveRoute, useAdaptiveContent } from '../hooks/useAdaptiveRoute.js';
import { useUser } from '../context/UserContext.jsx';

// Mock react para que ejecute useMemo de forma síncrona
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useMemo: (fn) => fn(),
  };
});

// Mock UserContext
vi.mock('../context/UserContext.jsx', () => ({
  useUser: vi.fn()
}));

describe('useAdaptiveRoute Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar los módulos intactos si no hay perfil de usuario o si la lista está vacía', () => {
    useUser.mockReturnValue({ user: null });
    const modules = [{ id: 'm1', preferredStyle: 'visual' }];
    expect(useAdaptiveRoute(modules)).toEqual(modules);
    expect(useAdaptiveRoute([])).toEqual([]);
  });

  it('debe ordenar los módulos dando prioridad al estilo dominante y luego al secundario', () => {
    useUser.mockReturnValue({
      user: {
        cognitiveProfile: { primary: 'visual', secondary: 'kinesthetic' }
      }
    });

    const modules = [
      { id: 'm1', preferredStyle: 'kinesthetic' }, // secundario -> peso 1
      { id: 'm2', preferredStyle: 'auditory' },    // otro -> peso 0
      { id: 'm3', preferredStyle: 'visual' }       // primario -> peso 2
    ];

    const sorted = useAdaptiveRoute(modules);
    expect(sorted[0].id).toBe('m3'); // Visual
    expect(sorted[1].id).toBe('m1'); // Kinestésico
    expect(sorted[2].id).toBe('m2'); // Auditivo
  });
});

describe('useAdaptiveContent Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar null si la lección no contiene contentByStyle o si no hay perfil de usuario', () => {
    useUser.mockReturnValue({ user: null });
    const lesson = { id: 'l1', contentByStyle: { visual: 'Contenido visual' } };
    expect(useAdaptiveContent(lesson)).toBeNull();
    expect(useAdaptiveContent(null)).toBeNull();
  });

  it('debe retornar el contenido preferido según el estilo primario del usuario', () => {
    useUser.mockReturnValue({
      user: {
        cognitiveProfile: { primary: 'auditory', secondary: 'visual' }
      }
    });

    const lesson = {
      id: 'l1',
      contentByStyle: {
        visual: 'Visual content',
        auditory: 'Auditory content'
      }
    };

    expect(useAdaptiveContent(lesson)).toBe('Auditory content');
  });

  it('debe caer en el estilo secundario si el primario no está disponible', () => {
    useUser.mockReturnValue({
      user: {
        cognitiveProfile: { primary: 'kinesthetic', secondary: 'visual' }
      }
    });

    const lesson = {
      id: 'l1',
      contentByStyle: {
        visual: 'Visual content',
        auditory: 'Auditory content'
      }
    };

    expect(useAdaptiveContent(lesson)).toBe('Visual content');
  });

  it('debe caer en el primer contenido disponible si ni el primario ni el secundario existen', () => {
    useUser.mockReturnValue({
      user: {
        cognitiveProfile: { primary: 'kinesthetic', secondary: 'auditory' }
      }
    });

    const lesson = {
      id: 'l1',
      contentByStyle: {
        visual: 'Visual content'
      }
    };

    expect(useAdaptiveContent(lesson)).toBe('Visual content');
  });
});
