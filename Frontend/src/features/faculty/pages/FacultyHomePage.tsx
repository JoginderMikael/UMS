const facultyActions = [
  'View assigned courses',
  'Manage student rosters',
  'Grade submissions and assessments',
  'Track course performance insights',
]

function FacultyHomePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950 px-4 py-10 text-slate-100 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Faculty Workspace
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">Faculty Home</h1>
        <p className="mt-3 max-w-3xl text-slate-300 md:text-lg">
          Teaching, assessment, and student support tools in one focused faculty interface.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {facultyActions.map((action) => (
            <article key={action} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-white">{action}</h2>
              <p className="mt-2 text-sm text-slate-400">Component and API integration will be added during migration.</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

export default FacultyHomePage