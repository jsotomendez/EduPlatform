import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'edu_platform_secret_jwt_key_12345';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ ADVERTENCIA: JWT_SECRET no está configurado en las variables de entorno. Usando clave predeterminada insegura.');
}

/**
 * Middleware para validar el token de sesión Bearer JWT enviado por el cliente.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no provisto.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    // Adjuntar la información desofuscada del usuario a la petición
    req.user = user;
    next();
  });
}

/**
 * Middleware para autorizar roles específicos.
 * Debe colocarse después de authenticateToken.
 */
export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso no autorizado. Sesión no iniciada.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Acceso denegado. Rol no autorizado (se requiere: ${allowedRoles.join(', ')}).` });
    }
    next();
  };
}

