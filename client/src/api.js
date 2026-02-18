const API = '/quotecraft/api';

function getToken() { return localStorage.getItem('qc_token'); }
export function setToken(t) { localStorage.setItem('qc_token', t); }
export function clearToken() { localStorage.removeItem('qc_token'); }
export function isLoggedIn() { return !!getToken(); }

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!options.isFormData) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.headers.get('content-type')?.includes('application/pdf')) return res.blob();
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (d) => request('/auth/signup', { method: 'POST', body: JSON.stringify(d) }),
  login: (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  me: () => request('/auth/me'),
  getProfile: () => request('/profile'),
  updateProfile: (d) => request('/profile', { method: 'PUT', body: JSON.stringify(d) }),
  generateQuote: (formData) => request('/quotes/generate', { method: 'POST', body: formData, isFormData: true }),
  createQuote: (d) => request('/quotes', { method: 'POST', body: JSON.stringify(d) }),
  listQuotes: (status) => request(`/quotes${status ? `?status=${status}` : ''}`),
  getQuote: (id) => request(`/quotes/${id}`),
  updateQuote: (id, d) => request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteQuote: (id) => request(`/quotes/${id}`, { method: 'DELETE' }),
  sendQuote: (id) => request(`/quotes/${id}/send`, { method: 'POST' }),
  viewQuote: (id) => request(`/quotes/${id}/view`),
  acceptQuote: (id, action) => request(`/quotes/${id}/accept`, { method: 'POST', body: JSON.stringify({ action }) }),
  downloadPdf: (id, template) => request(`/quotes/${id}/pdf${template ? `?template=${template}` : ''}`),
  chat: (d) => request('/chat', { method: 'POST', body: JSON.stringify(d) }),
  chatHistory: (convId) => request(`/chat/${convId}`),
  chatConversations: () => request('/chat/conversations'),
};
