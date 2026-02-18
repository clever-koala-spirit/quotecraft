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

  // CRM - Clients
  listClients: (search, tag) => request(`/clients${search || tag ? `?${new URLSearchParams({ ...(search && { search }), ...(tag && { tag }) })}` : ''}`),
  getClient: (id) => request(`/clients/${id}`),
  createClient: (d) => request('/clients', { method: 'POST', body: JSON.stringify(d) }),
  updateClient: (id, d) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  addClientNote: (id, d) => request(`/clients/${id}/notes`, { method: 'POST', body: JSON.stringify(d) }),
  getClientTimeline: (id) => request(`/clients/${id}/timeline`),
  importClients: (clients) => request('/clients/import', { method: 'POST', body: JSON.stringify({ clients }) }),

  // CRM - Jobs
  listJobs: (stage) => request(`/jobs${stage ? `?stage=${stage}` : ''}`),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (d) => request('/jobs', { method: 'POST', body: JSON.stringify(d) }),
  updateJob: (id, d) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // CRM - Follow-ups
  listFollowups: (filter) => request(`/followups${filter ? `?filter=${filter}` : ''}`),
  createFollowup: (d) => request('/followups', { method: 'POST', body: JSON.stringify(d) }),
  updateFollowup: (id, d) => request(`/followups/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteFollowup: (id) => request(`/followups/${id}`, { method: 'DELETE' }),
};
