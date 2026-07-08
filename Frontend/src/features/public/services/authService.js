import axios from 'axios'
import { API_BASE_URL } from '../constants/authConstants'

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export async function loginWithCredentials(email, password) {
  try {
    const response = await authApi.post('/auth/login', { email, password })
    return response.data
  } catch (error) {
    throw toHttpError(error, 'Login request failed')
  }
}

export async function fetchCurrentUser(token) {
  try {
    const response = await authApi.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return unwrapEntity(response.data)
  } catch (error) {
    throw toHttpError(error, 'Fetch current user failed')
  }
}

function toHttpError(error, fallbackMessage) {
  const status = error?.response?.status
  const message = status
    ? `${fallbackMessage} with status ${status}`
    : error?.message || fallbackMessage

  const httpError = new Error(message)
  if (status) {
    httpError.status = status
  }

  return httpError
}

function unwrapEntity(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  const wrapperKeys = ['data', 'result', 'item', 'content', 'payload', 'record']
  for (const key of wrapperKeys) {
    const nested = value[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return unwrapEntity(nested)
    }
  }

  return value
}
