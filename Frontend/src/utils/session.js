import { roleHomePathMap } from '../constants/homeContent'

export function readCurrentUser() {
  const raw = localStorage.getItem('currentUserData')
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
      userPath: '/login.html',
      isLoggedIn: false,
    }
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  const roleKey = String(user.role || '').toUpperCase()

  return {
    userLabel: fullName || 'Login',
    userPath: roleHomePathMap[roleKey] ?? '/login.html',
    isLoggedIn: Boolean(fullName),
  }
}
