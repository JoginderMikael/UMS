import axios from 'axios'
import { API_BASE_URL } from '../constants/authConstants'

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

type HttpError = Error & {
  status?: number
}

type LoginResponse = {
  token: string
  [key: string]: unknown
}

type UserPayload = {
  role?: string
  [key: string]: unknown
}

export async function loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await authApi.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  } catch (error: unknown) {
    throw toHttpError(error, 'Login request failed')
  }
}

export async function fetchCurrentUser(token: string): Promise<UserPayload> {
  try {
    const response = await authApi.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return unwrapEntity(response.data) as UserPayload
  } catch (error: unknown) {
    throw toHttpError(error, 'Fetch current user failed')
  }
}

function toHttpError(error: unknown, fallbackMessage: string): HttpError {
  const maybeError = error as {
    response?: { status?: number }
    message?: string
  }

  const status = maybeError?.response?.status
  const message = status
    ? `${fallbackMessage} with status ${status}`
    : maybeError?.message || fallbackMessage

  const httpError: HttpError = new Error(message)
  if (status) {
    httpError.status = status
  }

  return httpError
}

function unwrapEntity(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  const wrapperKeys = ['data', 'result', 'item', 'content', 'payload', 'record']
  for (const key of wrapperKeys) {
    const nested = (value as Record<string, unknown>)[key]
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return unwrapEntity(nested)
    }
  }

  return value
}