import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadToken, readCurrentUser } from '../../../utils/session'
import {
  fetchAcademicContext,
  fetchCurrentStudentProfile,
  fetchExamStatuses,
  fetchFeeStatus,
  fetchRegisteredCourses,
  mergeCoursesWithExamStatus,
  type AcademicContext,
  type FeeStatus,
  type StudentCourse,
  type StudentProfile,
} from './studentServices'

type StudentPortalContextState = {
  token: string
  loading: boolean
  error: string
  profile: StudentProfile | null
  academic: AcademicContext | null
  courses: StudentCourse[]
  feeStatus: FeeStatus | null
  refreshPortal: () => Promise<void>
  refreshCourses: () => Promise<StudentCourse[]>
  refreshFeeStatus: () => Promise<FeeStatus | null>
  setCourses: React.Dispatch<React.SetStateAction<StudentCourse[]>>
  setFeeStatus: React.Dispatch<React.SetStateAction<FeeStatus | null>>
}

export function useStudentPortalContext(): StudentPortalContextState {
  const token = useMemo(() => loadToken() || '', [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [academic, setAcademic] = useState<AcademicContext | null>(null)
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null)

  const resolveStudentId = useCallback((candidate: StudentProfile | null): string => {
    const fallback = readCurrentUser()
    return String(candidate?.studentId || candidate?.userId || fallback?.['studentId' as keyof typeof fallback] || '')
  }, [])

  const refreshCourses = useCallback(async (): Promise<StudentCourse[]> => {
    if (!token || !profile) {
      setCourses([])
      return []
    }

    const studentId = resolveStudentId(profile)
    if (!studentId) {
      setCourses([])
      return []
    }

    const [registered, examMap] = await Promise.all([
      fetchRegisteredCourses(token, studentId),
      fetchExamStatuses(token, studentId).catch(() => ({})),
    ])

    const merged = mergeCoursesWithExamStatus(registered, examMap)
    setCourses(merged)
    return merged
  }, [token, profile, resolveStudentId])

  const refreshFeeStatus = useCallback(async (): Promise<FeeStatus | null> => {
    if (!token || !profile || !academic?.activeSemesterId) {
      setFeeStatus(null)
      return null
    }

    const studentId = resolveStudentId(profile)
    if (!studentId) {
      setFeeStatus(null)
      return null
    }

    const status = await fetchFeeStatus(token, studentId, academic.activeSemesterId)
    setFeeStatus(status)
    return status
  }, [academic?.activeSemesterId, profile, resolveStudentId, token])

  const refreshPortal = useCallback(async () => {
    if (!token) {
      setError('Session expired. Please login again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const [nextProfile, nextAcademic] = await Promise.all([
        fetchCurrentStudentProfile(token),
        fetchAcademicContext(token),
      ])

      setProfile(nextProfile)
      setAcademic(nextAcademic)

      const studentId = resolveStudentId(nextProfile)
      const [registered, examMap, nextFeeStatus] = await Promise.all([
        studentId ? fetchRegisteredCourses(token, studentId) : Promise.resolve([]),
        studentId ? fetchExamStatuses(token, studentId).catch(() => ({})) : Promise.resolve({}),
        studentId && nextAcademic.activeSemesterId
          ? fetchFeeStatus(token, studentId, nextAcademic.activeSemesterId).catch(() => null)
          : Promise.resolve(null),
      ])

      setCourses(mergeCoursesWithExamStatus(registered, examMap))
      setFeeStatus(nextFeeStatus)
    } catch (portalError) {
      const message = portalError instanceof Error ? portalError.message : 'Failed to load student workspace.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [resolveStudentId, token])

  useEffect(() => {
    void refreshPortal()
  }, [refreshPortal])

  return {
    token,
    loading,
    error,
    profile,
    academic,
    courses,
    feeStatus,
    refreshPortal,
    refreshCourses,
    refreshFeeStatus,
    setCourses,
    setFeeStatus,
  }
}
