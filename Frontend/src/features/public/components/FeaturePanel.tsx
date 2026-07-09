type FeaturePanelProps = {
  title: string
  description: string
  badge?: string
  items?: string[]
}

function FeaturePanel({ title, description, badge, items = [] }: FeaturePanelProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/50 md:p-7">
      {badge ? (
        <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
          {badge}
        </p>
      ) : null}

      <h2 className="mt-3 text-2xl font-bold text-[#0b3c5d]">{title}</h2>
      <p className="mt-3 leading-7 text-slate-700">{description}</p>

      {items.length ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-slate-700">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export default FeaturePanel