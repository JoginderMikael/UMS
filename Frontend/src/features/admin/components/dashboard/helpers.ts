import type { User } from '../../services/adminServices'

export type IdLike = {
  id?: string | number
  schoolId?: string | number
  departmentId?: string | number
  programId?: string | number
  courseId?: string | number
  userId?: string | number
  academicYearId?: string | number
  semesterId?: string | number
}

export function toId(value: IdLike): string {
  return String(
    value.id ||
      value.userId ||
      value.schoolId ||
      value.departmentId ||
      value.programId ||
      value.courseId ||
      value.academicYearId ||
      value.semesterId ||
      '',
  )
}

export function text(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }
  return String(value)
}

export function fullName(user: User): string {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed user'
}
