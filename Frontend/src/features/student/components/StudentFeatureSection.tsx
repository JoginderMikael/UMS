import type { ReactNode } from 'react'

type StudentFeatureSectionProps = {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}

function StudentFeatureSection({ title, subtitle, children, actions }: StudentFeatureSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 shadow-xl shadow-black/10 backdrop-blur-xl md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export default StudentFeatureSection