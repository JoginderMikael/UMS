function LoginFormCard({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  canSubmit,
  errorMessage,
}) {
  return (
    <section className="w-full rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl shadow-slate-900/30 backdrop-blur-xl md:p-9">
      <header className="text-center">
        <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Secure Access
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[#0b3c5d] md:text-3xl">Aura Heights University</h1>
        <p className="mt-2 text-sm text-slate-500">University Management System Portal</p>
      </header>

      <form className="mt-7 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email Address</span>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={onInputChange}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onInputChange}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="w-full rounded-xl bg-linear-to-r from-[#0b3c5d] to-sky-700 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </section>
  )
}

export default LoginFormCard
