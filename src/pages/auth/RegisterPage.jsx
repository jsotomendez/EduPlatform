import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateForm,
} from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const { handleRegister, isLoading, error, setError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: null }));
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors, isValid } = validateForm(form, {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
    });
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    handleRegister(form);
  };

  return (
    <section>
      <div className={styles.header}>
        <div className={styles.logoMini}>
          <i className="fa-solid fa-brain" aria-hidden="true" />
        </div>
        <h1 className={styles.title}>Crea tu cuenta</h1>
        <p className={styles.subtitle}>Comienza tu viaje de aprendizaje adaptativo</p>
      </div>

      {error && (
        <div className={styles.alert} role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        {/* Selector de rol */}
        <div>
          <p
            className={styles.subtitle}
            style={{
              fontSize: 'var(--fs-sm)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Soy...
          </p>
          <div className={styles.roleSelector} style={{ marginTop: 'var(--space-3)' }}>
            {[
              { value: 'student', icon: 'fa-user-graduate', label: 'Estudiante' },
              { value: 'teacher', icon: 'fa-chalkboard-user', label: 'Docente' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                className={[styles.roleOption, form.role === r.value ? styles.selected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                aria-pressed={form.role === r.value}
              >
                <span className={styles.roleIcon}>
                  <i className={`fa-solid ${r.icon}`} aria-hidden="true" />
                </span>
                <span className={styles.roleLabel}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Nombre completo"
          id="reg-name"
          name="name"
          type="text"
          icon="fa-user"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          placeholder="Ej: Brigitte Pico Peralta"
          required
        />
        <Input
          label="Correo electrónico"
          id="reg-email"
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
        <Input
          label="Contraseña"
          id="reg-password"
          name="password"
          type="password"
          icon="fa-lock"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          placeholder="Mínimo 8 caracteres"
          required
          hint="Usa letras, números y símbolos para mayor seguridad."
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
          Crear cuenta gratis
        </Button>
      </form>

      <p className={styles.switchLink} style={{ marginTop: 'var(--space-6)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.LOGIN} className={styles.link}>
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
