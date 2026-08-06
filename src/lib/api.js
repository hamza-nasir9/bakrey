import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL

console.log("VITE_API_URL =", configuredApiUrl)

const api = axios.create({
  baseURL: configuredApiUrl || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('akb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error("API ERROR:", error)

    if (!error.response && !configuredApiUrl)
      error.userMessage = 'The production API is not configured. Set VITE_API_URL to the deployed backend URL followed by /api, then redeploy the frontend.'
    else if (!error.response)
      error.userMessage = 'The API server is unreachable. Verify VITE_API_URL, backend deployment, CORS, and network access.'

    return Promise.reject(error)
  }
)

export default api