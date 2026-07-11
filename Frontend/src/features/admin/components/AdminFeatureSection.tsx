type AdminFeatureSectionProps = {
  title?: string
  description?: string
  highlights?: string[]
}

function AdminFeatureSection({
  title = 'Admin Feature',
  description = 'This admin module is ready for the next migration step.',
  highlights = [],
}: AdminFeatureSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
      <p className="inline-flex rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
        Admin Module
      </p>
      <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-white">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>

      {highlights.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default AdminFeatureSection