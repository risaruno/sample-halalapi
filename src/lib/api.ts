import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { API_BASE_URL } from './constants'
import { tokenHolder } from './tokenHolder'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT to every outgoing request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenHolder.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

// Silently refresh token on 401 and retry the original request once
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = tokenHolder.refresh().finally(() => {
          isRefreshing = false
          // Keep refreshPromise set until after all waiters have proceeded
          setTimeout(() => { refreshPromise = null }, 0)
        })
      }

      // Capture the current promise before it can be nulled
      const pending = refreshPromise
      if (pending) await pending

      const newToken = tokenHolder.getToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)

export default api

