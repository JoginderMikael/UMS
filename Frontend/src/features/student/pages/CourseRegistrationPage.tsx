import { useEffect, useMemo, useState } from 'react'
import StudentFeatureSection from '../components/StudentFeatureSection'
import {
  fetchProgramCourses,
  fetchSchoolCourses,
  registerCourse,
  registerCoursesBulk,
  type StudentCourse,
} from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function CourseRegistrationPage() {
  const { token, loading, error, profile, courses, refreshCourses } = useStudentPortalContext()
  const [status, setStatus] = useState('')
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [showOtherCourses, setShowOtherCourses] = useState(false)
  const [otherSearch, setOtherSearch] = useState('')
  const [affiliatedCourses, setAffiliatedCourses] = useState<StudentCourse[]>([])
  const [otherCourses, setOtherCourses] = useState<StudentCourse[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])

  const registeredCourseIds = useMemo(() => new Set(courses.map((item) => item.courseId)), [courses])

  useEffect(() => {
    if (!token || !profile) return

    let active = true
    setCatalogLoading(true)
    setStatus('Loading course catalog...')

    void Promise.all([
      fetchProgramCourses(token, profile.programId).catch(() => []),
      fetchSchoolCourses(token, profile.schoolId).catch(() => []),
    ])
      .then(([programRows, schoolRows]) => {
        if (!active) return

        const affiliated = programRows.filter((item) => {
          if (!profile.yearOfStudy || !item.yearOfStudy) return true
          return item.yearOfStudy <= profile.yearOfStudy
        })

        const affiliatedIds = new Set(affiliated.map((item) => item.courseId))
        const others = schoolRows.filter((item) => !affiliatedIds.has(item.courseId))

        setAffiliatedCourses(affiliated)
        setOtherCourses(others)
        setStatus('Select courses and register.')
      })
      .catch((catalogError) => {
        if (!active) return
        const message = catalogError instanceof Error ? catalogError.message : 'Failed to load course catalog.'
        setStatus(message)
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })

    return () => {
      active = false
    }
  }, [profile, token])

  const filteredOtherCourses = useMemo(() => {
    const q = otherSearch.trim().toLowerCase()
    if (!q) return otherCourses
    return otherCourses.filter(
      (item) =>
        item.courseTitle.toLowerCase().includes(q) ||
        item.courseCode.toLowerCase().includes(q) ||
        item.departmentName.toLowerCase().includes(q),
    )
  }, [otherCourses, otherSearch])

  const studentId = String(profile?.studentId || profile?.userId || '')

  async function handleSingleRegistration(courseId: string, courseCode: string): Promise<void> {
    if (!token || !studentId || !courseId) return
    try {
      setStatus(`Registering ${courseCode || 'selected course'}...`)
      await registerCourse(token, studentId, courseId)
      await refreshCourses()
      setSelectedCourseIds((previous) => previous.filter((id) => id !== courseId))
      setStatus(`${courseCode || 'Course'} registered successfully.`)
    } catch (registrationError) {
      setStatus(registrationError instanceof Error ? registrationError.message : 'Failed to register course.')
    }
  }

  async function handleBulkRegistration(): Promise<void> {
    if (!token || !studentId) return
    const candidates = selectedCourseIds.filter((id) => !registeredCourseIds.has(id))
    if (candidates.length === 0) {
      setStatus('Select one or more unregistered courses first.')
      return
    }

    try {
      setStatus(`Registering ${candidates.length} selected course(s)...`)
      await registerCoursesBulk(token, studentId, candidates)
      setSelectedCourseIds([])
      await refreshCourses()
      setStatus('Selected courses registered successfully.')
    } catch (registrationError) {
      setStatus(registrationError instanceof Error ? registrationError.message : 'Bulk registration failed.')
    }
  }

  function toggleCourseSelection(courseId: string): void {
    if (!courseId || registeredCourseIds.has(courseId)) return
    setSelectedCourseIds((previous) =>
      previous.includes(courseId) ? previous.filter((id) => id !== courseId) : [...previous, courseId],
    )
  }

  function renderRows(rows: StudentCourse[]) {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-3 py-4 text-center text-slate-400">
            No courses found.
          </td>
        </tr>
      )
    }

    return rows.map((course) => {
      const isRegistered = registeredCourseIds.has(course.courseId)
      const isSelected = selectedCourseIds.includes(course.courseId)
      return (
        <tr key={course.courseId} className="border-b border-white/5 last:border-b-0">
          <td className="px-3 py-2">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isRegistered || !course.courseId}
              onChange={() => toggleCourseSelection(course.courseId)}
            />
          </td>
          <td className="px-3 py-2">{course.courseCode || 'N/A'}</td>
          <td className="px-3 py-2">{course.courseTitle || 'N/A'}</td>
          <td className="px-3 py-2">{course.creditUnits || 'N/A'}</td>
          <td className="px-3 py-2">{course.courseType || 'N/A'}</td>
          <td className="px-3 py-2">{course.yearOfStudy || 'N/A'}</td>
          <td className="px-3 py-2">
            {isRegistered ? (
              <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                Registered
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleSingleRegistration(course.courseId, course.courseCode)}
                className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
              >
                Register
              </button>
            )}
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="space-y-4">
      <StudentFeatureSection
        title="Course registration"
        subtitle="Register program-affiliated courses first, then optionally discover other school courses."
        actions={
          <>
            <button
              type="button"
              onClick={() => void handleBulkRegistration()}
              className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Register selected ({selectedCourseIds.length})
            </button>
            <button
              type="button"
              onClick={() => setShowOtherCourses((value) => !value)}
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100"
            >
              {showOtherCourses ? 'Hide other courses' : 'Find other courses'}
            </button>
          </>
        }
      >
        {loading || catalogLoading ? <p className="text-sm text-slate-300">Loading course catalog...</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {status ? <p className="text-sm text-cyan-100">{status}</p> : null}

        <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-800/80 text-xs uppercase tracking-[0.08em] text-slate-400">
              <tr>
                <th className="px-3 py-2">Select</th>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">CU</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>{renderRows(affiliatedCourses)}</tbody>
          </table>
        </div>
      </StudentFeatureSection>

      {showOtherCourses ? (
        <StudentFeatureSection title="Other courses" subtitle="Search and register from wider school offerings.">
          <div className="mb-3">
            <input
              value={otherSearch}
              onChange={(event) => setOtherSearch(event.target.value)}
              placeholder="Search by code, title, or department"
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-hidden ring-cyan-300/40 focus:ring-1"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-800/80 text-xs uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-3 py-2">Select</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">CU</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>{renderRows(filteredOtherCourses)}</tbody>
            </table>
          </div>
        </StudentFeatureSection>
      ) : null}
    </div>
  )
}

export default CourseRegistrationPage