import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { roleHomePathMap } from '../../constants/homeContent'
import { loadToken, readCurrentUser } from '../../utils/session'

type RoleKey = 'ADMIN' | 'STUDENT' | 'FACULTY'

type ProtectedRouteProps = {
  allowedRoles: RoleKey[]
  children: ReactNode
}

type GuestOnlyRouteProps = {
  children: ReactNode
}

function resolveSessionRole(): string {
  const user = readCurrentUser()
  return String(user?.role || '').toUpperCase()
}

function resolveAuthenticatedHome(role: string): string {
  return roleHomePathMap[role] ?? '/'
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = loadToken()
  const user = readCurrentUser()
  const role = resolveSessionRole()

  if (!token || !user || !role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles.includes(role as RoleKey)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const token = loadToken()
  const user = readCurrentUser()
  const role = resolveSessionRole()

  if (token && user && role) {
    return <Navigate to={resolveAuthenticatedHome(role)} replace />
  }

  return <>{children}</>
}
