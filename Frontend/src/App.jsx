const quickStartItems = [
  'React + Vite project scaffolded',
  'Tailwind CSS configured with @tailwindcss/vite',
  'Frontend folder prepared for UMS module migration',
]

function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium tracking-wide text-violet-200">
          UMS Frontend • React Migration
        </p>

        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          University Management System
        </h1>

        <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          New frontend workspace is now powered by React, Vite, and Tailwind CSS.
          This is your clean starting point to migrate modules from
          <code className="mx-1 rounded bg-slate-800 px-1.5 py-0.5 text-slate-100">frontend-legacy</code>
          into modern components.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-100">Project status</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {quickStartItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[2px] text-emerald-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

export default App
