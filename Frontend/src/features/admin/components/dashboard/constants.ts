import type { DashboardSummary } from '../../services/adminServices'

export type Section = 'overview' | 'users' | 'schools' | 'departments' | 'programs' | 'courses' | 'cycle'

export type StatusKind = 'success' | 'error' | 'info'

export type Status = {
  text: string
  kind: StatusKind
}

export const navItems: Array<{ key: Section; label: string; icon: string; subtitle: string }> = [
  { key: 'overview', label: 'Overview', icon: '📊', subtitle: 'System health and quick actions' },
  { key: 'users', label: 'Users', icon: '👥', subtitle: 'Create / lookup / deactivate / restore users' },
  { key: 'schools', label: 'Schools', icon: '🏛️', subtitle: 'School lifecycle management' },
  { key: 'departments', label: 'Departments', icon: '🧭', subtitle: 'School-scoped departments controls' },
  { key: 'programs', label: 'Programs', icon: '🎓', subtitle: 'Program lifecycle + course mapping' },
  { key: 'courses', label: 'Courses', icon: '📚', subtitle: 'Course catalog operations' },
  { key: 'cycle', label: 'Academic Cycle', icon: '🗓️', subtitle: 'Academic year and semester controls' },
]

export const summaryFallback: DashboardSummary = {
  totalSchools: 0,
  totalDepartments: 0,
  totalPrograms: 0,
  totalCourses: 0,
  totalStudents: 0,
  totalAdmins: 0,
  totalFaculty: 0,
  activeAcademicYear: 'N/A',
  activeSemester: 'N/A',
}
