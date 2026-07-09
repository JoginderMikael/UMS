function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-4 py-10 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3 md:items-end">
        <div>
          <p className="bg-linear-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-lg font-bold text-transparent">
            Aura Heights University
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Building leaders through innovation, excellence, and community impact.
          </p>
        </div>

        <div className="text-sm text-slate-300">
          <p className="font-semibold text-white">Contact</p>
          <p className="mt-1">Email: info@ahu.edu</p>
          <p>Phone: +254 797753625</p>
        </div>

        <div className="text-sm text-slate-300 md:text-right">
          <a className="text-slate-200 transition hover:text-cyan-300" href="/login">
            Login Portal
          </a>
          <p className="mt-2">© 2026 Aura Heights University. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer