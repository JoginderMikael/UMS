const studentQuickLinks = [
  'Course registration',
  'Exam registration',
  'Fee payment & balances',
  'Transcript & academic progress',
]

function StudentDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-full border border-sky-300/40 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-800">
          Student Portal
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0b3c5d] md:text-5xl">Student Dashboard</h1>
        <p className="mt-3 max-w-3xl text-slate-600 md:text-lg">
          Manage your academics, registrations, and financial tasks from one unified
          student workspace.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {studentQuickLinks.map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">{item}</h2>
              <p className="mt-2 text-sm text-slate-500">Feature page is scaffolded and ready for migration.</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

export default StudentDashboardPage