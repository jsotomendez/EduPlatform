export const LEARNING_STYLES = {
  visual: {
    key: 'visual',
    label: 'Visual',
    icon: 'fa-eye',
    color: 'var(--color-vak-visual)',
    bg: 'var(--color-vak-visual-bg)',
    description:
      'Aprendes mejor a través de imágenes, diagramas, videos y representaciones visuales. Necesitas ver para entender.',
    tips: [
      'Usa mapas conceptuales y diagramas',
      'Resalta con colores tu material de estudio',
      'Busca videos y presentaciones visuales',
      'Organiza la información en tablas y listas',
    ],
    contentPreference: 'video',
  },
  auditory: {
    key: 'auditory',
    label: 'Auditivo',
    icon: 'fa-podcast',
    color: 'var(--color-vak-auditory)',
    bg: 'var(--color-vak-auditory-bg)',
    description:
      'Aprendes mejor escuchando explicaciones, debates y discusiones. La palabra hablada es tu mejor aliada.',
    tips: [
      'Escucha podcasts y grabaciones de clase',
      'Explica en voz alta lo que aprendes',
      'Participa en grupos de estudio y debates',
      'Usa música instrumental al estudiar',
    ],
    contentPreference: 'audio',
  },
  kinesthetic: {
    key: 'kinesthetic',
    label: 'Kinestésico',
    icon: 'fa-hand-pointer',
    color: 'var(--color-vak-kinesthetic)',
    bg: 'var(--color-vak-kinesthetic-bg)',
    description:
      'Aprendes mejor haciendo, experimentando y practicando. Necesitas involucrarte activamente con el contenido.',
    tips: [
      'Resuelve ejercicios prácticos constantemente',
      'Usa simulaciones e interactivos',
      'Toma descansos frecuentes al estudiar',
      'Relaciona los conceptos con experiencias reales',
    ],
    contentPreference: 'interactive',
  },
};

export const STYLE_ORDER = ['visual', 'auditory', 'kinesthetic'];
