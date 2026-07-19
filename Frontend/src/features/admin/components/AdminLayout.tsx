import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, readCurrentUser } from '../../../utils/session'

type AdminNavItem = {
  label: string
  to: string
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Academic Years', to: '/admin/academic-years' },
  { label: 'Schools', to: '/admin/schools' },
  { label: 'Departments', to: '/admin/departments' },
  { label: 'Programs', to: '/admin/programs' },
  { label: 'Courses', to: '/admin/courses' },
  { label: 'Enrollments', to: '/admin/enrollments' },
  { label: 'Fees', to: '/admin/fees' },
  { label: 'Profile', to: '/admin/profile' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userDisplayName = useMemo(() => {
    const user = readCurrentUser()
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    return fullName || 'Admin User'
  }, [])

  function handleLogout(): void {
    clearSession()
    navigate('/login', { replace: true })
  }

  function closeMobileMenu(): void {
    setIsMobileMenuOpen(false)
  }

  function openMobileMenu(): void {
    setIsMobileMenuOpen(true)
  }

  const activeLabel =
    adminNavItems.find((item) =>
      item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to),
    )?.label || 'Admin Workspace'

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navContent = (
    <>
      <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
        Admin Portal
      </p>
      <h1 className="mt-4 text-2xl font-black tracking-tight">UMS Control Center</h1>
      <p className="mt-2 text-sm text-slate-300">Modern workspace for institution operations.</p>

      <nav className="mt-6 space-y-1.5">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-violet-500/25 text-violet-100 ring-1 ring-violet-300/50'
                  : 'text-slate-200 hover:bg-slate-800/80'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-70 border-r border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl lg:block">
        {navContent}
      </aside>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-slate-950/65"
            aria-label="Close navigation menu"
          />

          <aside
            id="admin-mobile-sidenav"
            className="relative z-10 h-full w-[min(86vw,320px)] border-r border-white/10 bg-slate-900 p-5 shadow-2xl"
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-100"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-70">
        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openMobileMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xl text-slate-100 transition hover:bg-white/10 lg:hidden"
                  aria-controls="admin-mobile-sidenav"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Open navigation menu"
                >
                  ☰
                </button>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current view</p>
                  <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">{activeLabel}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 sm:block">
                  {userDisplayName}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-rose-300/35 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 md:px-8 md:py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
