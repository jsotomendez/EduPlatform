import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { validateEmail, validatePassword, validateForm } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const { handleLogin, handleLoadDemo, isLoading, error, setError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: null }));
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors, isValid } = validateForm(form, {
      email: validateEmail,
      password: validatePassword,
    });
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    handleLogin(form.email, form.password);
  };

  return (
    <section>
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.logoMini}>
          <i className="fa-solid fa-brain" aria-hidden="true" />
        </div>
        <h1 className={styles.title}>Bienvenido de nuevo</h1>
        <p className={styles.subtitle}>Continúa tu ruta de aprendizaje personalizada</p>
      </div>

      {/* Error global */}
      {error && (
        <div className={styles.alert} role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <Input
          label="Correo electrónico"
          id="login-email"
          name="email"
          type="email"
          icon="fa-envelope"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          placeholder="tu@correo.edu.co"
          required
          autoComplete="email"
        />

        <div>
          <Input
            label="Contraseña"
            id="login-password"
            name="password"
            type={showPass ? 'text' : 'password'}
            icon="fa-lock"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className={styles.showPass}
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
            {showPass ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
          Iniciar sesión
        </Button>

        <div className={styles.divider}>
          <span>o continúa con</span>
        </div>

        <button type="button" className={styles.googleBtn} disabled>
          <i className="fa-brands fa-google" aria-hidden="true" />
          Continuar con Google
          <span className={styles.soon}>Próximamente</span>
        </button>
      </form>

      {/* Demo */}
      <div className={styles.demoSection}>
        <p className={styles.demoLabel}>¿Quieres explorar sin registrarte?</p>
        <div className={styles.demoButtons}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleLoadDemo('student')}
            isLoading={isLoading}
            icon="fa-user-graduate"
          >
            Demo Estudiante
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLoadDemo('teacher')}
            isLoading={isLoading}
            icon="fa-chalkboard-user"
          >
            Demo Docente
          </Button>
        </div>
      </div>

      <p className={styles.switchLink}>
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.REGISTER} className={styles.link}>
          Regístrate aquí
        </Link>
      </p>
    </section>
  );
}
