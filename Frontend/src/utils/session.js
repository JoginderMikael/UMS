import { roleHomePathMap } from '../constants/homeContent'

const TOKEN_KEY = 'token'
const CURRENT_USER_KEY = 'currentUserData'

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function loadToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function readCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function resolveUserNavState() {
  const user = readCurrentUser()

  if (!user) {
    return {
      userLabel: 'Login',
      userPath: '/login',
      isLoggedIn: false,
    }
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  const roleKey = String(user.role || '').toUpperCase()

  return {
    userLabel: fullName || 'Login',
    userPath: roleHomePathMap[roleKey] ?? '/login',
    isLoggedIn: Boolean(fullName),
  }
}
