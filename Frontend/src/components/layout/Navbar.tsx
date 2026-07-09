import { Link, NavLink } from 'react-router-dom'
import type { NavItem } from '../../constants/homeContent'

type NavbarProps = {
  navItems: NavItem[]
  userLabel: string
  userPath: string
  isLoggedIn: boolean
}

function Navbar({ navItems, userLabel, userPath, isLoggedIn }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-slate-950/70 text-white shadow-lg shadow-slate-950/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        <p className="bg-linear-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-lg font-bold tracking-wide text-transparent md:text-xl">
          Aura Heights University
        </p>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center gap-2 md:gap-4">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to={userPath}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isLoggedIn
                    ? 'border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/20'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {userLabel}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar