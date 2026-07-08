function Navbar({ navItems, userLabel, userPath, isLoggedIn }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/10 bg-[#0b3c5d] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <p className="text-lg font-bold tracking-wide md:text-xl">Aura Heights University</p>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center gap-2 md:gap-4">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a
                href={userPath}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isLoggedIn
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {userLabel}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
