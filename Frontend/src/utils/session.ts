import { roleHomePathMap } from '../constants/homeContent'

const TOKEN_KEY = 'token'
const CURRENT_USER_KEY = 'currentUserData'

export type CurrentUser = {
  firstName?: string
  lastName?: string
  role?: string
}

export type UserNavState = {
  userLabel: string
  userPath: string
  isLoggedIn: boolean
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveCurrentUser(user: unknown): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function readCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

export function resolveUserNavState(): UserNavState {
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