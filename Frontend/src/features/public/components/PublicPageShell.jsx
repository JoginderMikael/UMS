import { useMemo } from 'react'
import Footer from '../../../components/layout/Footer'
import Navbar from '../../../components/layout/Navbar'
import { navItems } from '../../../constants/homeContent'
import { resolveUserNavState } from '../../../utils/session'

function PublicPageShell({ eyebrow, title, subtitle, children }) {
  const userNavState = useMemo(() => resolveUserNavState(), [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar navItems={navItems} {...userNavState} />

      <main className="pt-20 md:pt-18">
        <section className="bg-linear-to-br from-slate-950 via-slate-900 to-sky-950 px-4 py-14 text-white md:px-8 md:py-18">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-slate-200/95 md:text-lg">{subtitle}</p>
          </div>
        </section>

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-6xl">{children}</div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default PublicPageShell
