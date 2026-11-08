const API_URL = import.meta.env.VITE_API_URL;
export const TOKEN_KEY = 'userToken';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  };
  const auth = token ?? localStorage.getItem(TOKEN_KEY);
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the server. It may be waking up — try again in a few seconds.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data;
}

export const stocksApi = {
  signup: (payload) => apiRequest('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  me: () => apiRequest('/auth/me'),
  updatePreferences: (sectors) => apiRequest('/auth/preferences', { method: 'PUT', body: { sectors } }),
  sectors: () => apiRequest('/stocks/sectors'),
  rankings: ({ horizon, sectors }) => {
    const qs = new URLSearchParams({ horizon });
    if (sectors?.length) qs.set('sectors', sectors.join(','));
    return apiRequest(`/stocks/rankings?${qs}`);
  },
  search: (q) => apiRequest(`/stocks/search?q=${encodeURIComponent(q)}`),
  portfolio: () => apiRequest('/portfolio'),
  addHolding: (h) => apiRequest('/portfolio', { method: 'POST', body: h }),
  updateHolding: (id, h) => apiRequest(`/portfolio/${id}`, { method: 'PUT', body: h }),
  deleteHolding: (id) => apiRequest(`/portfolio/${id}`, { method: 'DELETE' }),
};
