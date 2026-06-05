import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateToken } from '../../backend/middlewares/auth.middleware.js';

vi.mock('jsonwebtoken', () => {
  return {
    default: {
      verify: (token, secret, callback) => {
        if (token === 'token_valido_99999') {
          callback(null, { id: 'u_test', role: 'student' });
        } else {
          callback(new Error('Token inválido o expirado'));
        }
      }
    }
  };
});

describe('Middleware de Autenticación authenticateToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  it('debe retornar 401 si no se provee el header Authorization', () => {
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('no provisto') });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token no tiene el formato Bearer', () => {
    req.headers['authorization'] = 'token_sin_formato';
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si el token es inválido o corrupto', () => {
    req.headers['authorization'] = 'Bearer token_invalido_corrupto_99999';
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Token inválido o expirado') });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe adjuntar el usuario y llamar a next() si el token es válido', () => {
    req.headers['authorization'] = 'Bearer token_valido_99999';

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('u_test');
    expect(req.user.role).toBe('student');
  });
});
