import axios from 'axios'

const api = axios.create({ baseURL: '' })

// Attach JWT if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('histry_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const contentApi = {
  getToday: (locale = 'en') => api.get(`/content/today?locale=${locale}`),
  reveal:   (locale = 'en') => api.get(`/content/today/reveal?locale=${locale}`),
}

export const gameApi = {
  guess: (guessedYear, attempt) =>
    api.post(`/game/guess?attempt=${attempt}`, { guessedYear }),
}

export const authApi = {
  login:    (identifier, password) => api.post('/auth/login', { identifier, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  me:       () => api.get('/auth/me'),
}

export const suggestionApi = {
  apply:         (motivation)   => api.post('/suggestions/apply', { motivation }),
  submit:        (data)         => api.post('/suggestions', data),
  mySuggestions: ()             => api.get('/suggestions/my'),
}

export const adminApi = {
  // Events
  listEvents:   ()         => api.get('/admin/events'),
  createEvent:  (data)     => api.post('/admin/events', data),
  updateEvent:  (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent:  (id)       => api.delete(`/admin/events/${id}`),
  toggleEvent:  (id)       => api.patch(`/admin/events/${id}/toggle`),
  // Suggestions
  listSuggestions:   ()           => api.get('/admin/suggestions'),
  approveSuggestion: (id, note)   => api.put(`/admin/suggestions/${id}/approve`, { adminNote: note }),
  rejectSuggestion:  (id, note)   => api.put(`/admin/suggestions/${id}/reject`,  { adminNote: note }),
  // Applicants
  listApplicants:    ()   => api.get('/admin/applicants'),
  approveApplicant:  (id) => api.put(`/admin/applicants/${id}/approve`),
  rejectApplicant:   (id) => api.put(`/admin/applicants/${id}/reject`),
}

export default api
