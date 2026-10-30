import axios from 'axios'

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, timeout: 15000 })

async function request(path, data) {
  try {
    const response = data === undefined ? await http.get(path) : await http.post(path, data)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'The account service is unavailable. Start the server and try again.')
  }
}

export const authApi = {
  register: data => request('/auth/register', data),
  login: data => request('/auth/login', data),
  logout: () => request('/auth/logout', {}),
  me: () => request('/auth/me'),
  verifyEmail: token => request('/auth/verify-email', { token }),
  requestPasswordReset: email => request('/auth/forgot-password', { email }),
  resetPassword: data => request('/auth/reset-password', data),
  updateProfile: data => http.put('/auth/profile', data, { withCredentials: true }).then(response => response.data).catch(error => {
    throw new Error(error.response?.data?.error || 'Could not update your profile.')
  }),
}

export const resumeApi = {
  list: async () => (await http.get('/resumes')).data.resumes,
  get: async id => (await http.get(`/resumes/${encodeURIComponent(id)}`)).data.resume,
  create: async data => (await http.post('/resumes', data)).data.resume,
  update: async (id, data) => (await http.put(`/resumes/${encodeURIComponent(id)}`, data)).data.resume,
  duplicate: async id => (await http.post(`/resumes/${encodeURIComponent(id)}/duplicate`)).data,
  remove: async id => (await http.delete(`/resumes/${encodeURIComponent(id)}`)).data,
}