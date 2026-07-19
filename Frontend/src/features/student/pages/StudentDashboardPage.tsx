import { Link } from 'react-router-dom'
import StudentFeatureSection from '../components/StudentFeatureSection'
import { formatSignedCurrency } from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function StudentDashboardPage() {
  const { loading, error, profile, academic, courses, feeStatus } = useStudentPortalContext()

  const quickLinks = [
    {
      title: 'Course registration',
      description: 'Register affiliated courses and optional school courses in one place.',
      to: '/student/course-registration',
    },
    {
      title: 'Semester registration',
      description: 'Enroll into active semester before downstream registration tasks.',
      to: '/student/semester-registration',
    },
    {
      title: 'Exam registration',
      description: 'Track exam eligibility and register course exams quickly.',
      to: '/student/exam-registration',
    },
    {
      title: 'Fee payment',
      description: 'View balance, submit fee payments, and confirm clearance status.',
      to: '/student/fee-payment',
    },
    {
      title: 'Transcript',
      description: 'Review semester results and your overall academic progression.',
      to: '/student/transcript',
    },
  ]

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-cyan-300/20 bg-linear-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-2xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Student Summary</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Welcome, {profile?.firstName || 'Student'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200 md:text-base">
          Unified workspace for semester workflow, course and exam registration, fee payments, and transcript checks.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Program</p>
            <p className="mt-1 font-semibold text-slate-100">{profile?.programName || 'N/A'}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Semester</p>
            <p className="mt-1 font-semibold text-slate-100">{academic?.activeSemesterName || 'N/A'}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Registered Courses</p>
            <p className="mt-1 font-semibold text-slate-100">{courses.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Fee Balance</p>
            <p className="mt-1 font-semibold text-slate-100">
              {feeStatus ? formatSignedCurrency(feeStatus.balance) : 'N/A'}
            </p>
          </article>
        </div>

        {loading ? <p className="mt-4 text-sm text-cyan-100">Loading your latest records...</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <StudentFeatureSection
        title="Student workflows"
        subtitle="All key operations from legacy student portal are now modularized below."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <article key={item.to} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-base font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              <Link
                to={item.to}
                className="mt-4 inline-flex rounded-xl border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
              >
                Open section
              </Link>
            </article>
          ))}
        </div>
      </StudentFeatureSection>
    </div>
  )
}

export default StudentDashboardPage