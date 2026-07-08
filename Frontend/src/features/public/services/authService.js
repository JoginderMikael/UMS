import { API_BASE_URL } from '../constants/authConstants'

export async function loginWithCredentials(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = new Error(`Login request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = new Error(`Fetch current user failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  const payload = await response.json()
  return unwrapEntity(payload)
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
