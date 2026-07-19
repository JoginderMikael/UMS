import { useState } from 'react'
import StudentFeatureSection from '../components/StudentFeatureSection'
import { registerExam } from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function ExamRegistrationPage() {
  const { token, profile, courses, feeStatus, refreshCourses, loading, error } = useStudentPortalContext()
  const [status, setStatus] = useState('')

  const studentId = String(profile?.studentId || profile?.userId || '')
  const feeCleared = Boolean(feeStatus?.cleared)

  async function handleRegisterExam(courseId: string, courseCode: string): Promise<void> {
    if (!token || !studentId || !courseId) return
    if (!feeCleared) {
      setStatus('Fee is not cleared. Exam registration is disabled until payment is cleared.')
      return
    }

    try {
      setStatus(`Registering exam for ${courseCode || 'selected course'}...`)
      await registerExam(token, studentId, courseId)
      await refreshCourses()
      setStatus(`Exam registration completed for ${courseCode || 'selected course'}.`)
    } catch (registrationError) {
      setStatus(registrationError instanceof Error ? registrationError.message : 'Failed to register exam.')
    }
  }

  return (
    <StudentFeatureSection
      title="Exam registration"
      subtitle={
        feeCleared
          ? 'Fee is cleared. You can now register exams for your registered courses.'
          : 'Fee is not cleared. Registering exams is currently disabled.'
      }
    >
      {loading ? <p className="text-sm text-slate-300">Loading exam records...</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {status ? <p className="mb-3 text-sm text-cyan-100">{status}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-[0.08em] text-slate-400">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Course Title</th>
              <th className="px-3 py-2">Credit Units</th>
              <th className="px-3 py-2">Exam Registration</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                  No registered courses found for the active semester.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.courseId} className="border-b border-white/5 last:border-b-0">
                  <td className="px-3 py-2">{course.courseCode || 'N/A'}</td>
                  <td className="px-3 py-2">{course.courseTitle || 'N/A'}</td>
                  <td className="px-3 py-2">{course.creditUnits || 'N/A'}</td>
                  <td className="px-3 py-2">
                    {course.examRegistered ? (
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                        Registered
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!feeCleared}
                        onClick={() => void handleRegisterExam(course.courseId, course.courseCode)}
                        className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100 transition enabled:hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Register Exam
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </StudentFeatureSection>
  )
}

export default ExamRegistrationPage