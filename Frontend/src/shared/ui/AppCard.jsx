function AppCard({ title, children }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {title ? <h3 className="text-lg font-semibold text-slate-800">{title}</h3> : null}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </article>
  )
}

export default AppCard
