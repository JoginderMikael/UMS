import { useState } from 'react'
import StudentFeatureSection from '../components/StudentFeatureSection'
import { registerCurrentSemester } from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function SemesterRegistrationPage() {
  const { token, profile, academic, loading, error } = useStudentPortalContext()
  const [status, setStatus] = useState('Enroll in the active semester before registering courses.')
  const [busy, setBusy] = useState(false)

  const studentId = String(profile?.studentId || profile?.userId || '')

  async function handleRegisterSemester(): Promise<void> {
    if (!token || !studentId) {
      setStatus('Student ID not found for semester registration.')
      return
    }

    setBusy(true)
    setStatus('Registering semester...')
    try {
      await registerCurrentSemester(token, studentId)
      setStatus('Semester registered successfully.')
    } catch (registrationError) {
      setStatus(registrationError instanceof Error ? registrationError.message : 'Failed to register semester.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <StudentFeatureSection title="Semester registration" subtitle="Activate your semester enrollment context.">
      {loading ? <p className="text-sm text-slate-300">Loading semester context...</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Current Semester</p>
          <p className="mt-1 font-semibold text-white">{academic?.activeSemesterName || 'N/A'}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Academic Year</p>
          <p className="mt-1 font-semibold text-white">{academic?.activeAcademicYearName || 'N/A'}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Student ID</p>
          <p className="mt-1 font-semibold text-white">{studentId || 'N/A'}</p>
        </article>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleRegisterSemester()}
          disabled={busy}
          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? 'Registering...' : 'Register Semester'}
        </button>
        <p className="text-sm text-cyan-100">{status}</p>
      </div>
    </StudentFeatureSection>
  )
}

export default SemesterRegistrationPage