const adminModules = [
  'User & role management',
  'School / department / program setup',
  'Course and semester administration',
  'Enrollment and fee operations',
]

function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
          Admin Portal
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">Administrator Dashboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300 md:text-lg">
          Control center for configuration, governance, and operational oversight across the
          University Management System.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {adminModules.map((module) => (
            <article key={module} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-slate-100">{module}</h2>
              <p className="mt-2 text-sm text-slate-400">Module page setup in progress for React migration.</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage