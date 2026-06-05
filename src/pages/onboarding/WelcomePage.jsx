/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import styles from './WelcomePage.module.css';

export function WelcomePage() {
  const { user } = useUser();
  const { reducedMotion } = useTheme();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const featureList = [
    { icon: 'fa-brain', label: 'Diagnóstico VAK', desc: '10 preguntas visuales, 3 min' },
    { icon: 'fa-route', label: 'Ruta adaptativa', desc: 'Contenido a tu medida' },
    { icon: 'fa-robot', label: 'Tutor IA', desc: 'Retroalimentación en tiempo real' },
  ];

  return (
    <motion.div 
      className={styles.page}
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className={styles.decorBg} aria-hidden="true">
        <motion.div 
          className={styles.circle1}
          animate={reducedMotion ? {} : { 
            y: [0, -20, 0],
            x: [0, 15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={styles.circle2}
          animate={reducedMotion ? {} : { 
            y: [0, 25, 0],
            x: [0, -20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={styles.circle3}
          animate={reducedMotion ? {} : { 
            y: [0, -15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className={styles.content}
        variants={cardVariants}
      >
        {/* Ícono central animado */}
        <motion.div 
          className={styles.iconWrap} 
          aria-hidden="true"
          variants={itemVariants}
        >
          <div className={styles.iconRing}>
            <motion.div 
              className={styles.iconCore}
              animate={reducedMotion ? {} : {
                scale: [1, 1.06, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut"
              }}
            >
              <i className="fa-solid fa-brain" />
            </motion.div>
          </div>
          <motion.div 
            className={styles.floatingBadge}
            animate={reducedMotion ? {} : {
              y: [0, -6, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          >
            <i className="fa-solid fa-leaf" />
          </motion.div>
        </motion.div>

        <motion.div className={styles.textBlock} variants={itemVariants}>
          <h1 className={styles.title}>Bienvenida, {firstName} 🎉</h1>
          <p className={styles.lead}>
            El sistema educativo tradicional ignora la diversidad cognitiva. Nuestra IA
            diagnosticará tu perfil para adaptar el contenido a tu propio ritmo.
          </p>
          <p className={styles.description}>
            En los próximos 3 minutos responderás 10 preguntas que nos permitirán conocer si eres un
            aprendiz <strong>Visual</strong>, <strong>Auditivo</strong> o{' '}
            <strong>Kinestésico</strong>. Con esa información, construiremos tu ruta de aprendizaje
            personalizada.
          </p>
        </motion.div>

        <motion.div className={styles.features} variants={itemVariants}>
          {featureList.map((f) => (
            <motion.div 
              key={f.label} 
              className={styles.featureCard}
              whileHover={reducedMotion ? {} : { 
                scale: 1.03, 
                y: -4,
                boxShadow: "var(--shadow-lg)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className={styles.featureIcon}>
                <i className={`fa-solid ${f.icon}`} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.featureLabel}>{f.label}</p>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className={styles.ctas} variants={itemVariants}>
          <Button
            variant="primary"
            size="lg"
            icon="fa-arrow-right"
            iconPosition="right"
            onClick={() => navigate(ROUTES.DIAGNOSTIC)}
          >
            Comenzar diagnóstico (toma 3 minutos)
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}>
            Saltar por ahora
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

