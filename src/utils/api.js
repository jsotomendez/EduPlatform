const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const token = localStorage.getItem('edu_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error en la solicitud.');
  }

  return data;
}

export const api = {
  get(path, options) {
    return request(path, { method: 'GET', ...options });
  },
  post(path, body, options) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  },
  put(path, body, options) {
    return request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  },
  delete(path, options) {
    return request(path, { method: 'DELETE', ...options });
  },
};
