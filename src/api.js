import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

export const analyzeScam = (message) => API.post('/analyze', { message })

export const getReports = () => API.get('/reports')