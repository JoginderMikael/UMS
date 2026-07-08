function LoginFormCard({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  canSubmit,
  errorMessage,
}) {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl shadow-slate-900/20">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-[#0b3c5d]">Aura Heights University</h1>
        <p className="mt-2 text-sm text-slate-500">University Management System Login</p>
      </header>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-[#3282b8] focus:ring-2 focus:ring-[#3282b8]/25"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-[#3282b8] focus:ring-2 focus:ring-[#3282b8]/25"
          />
        </label>

        {errorMessage ? (
          <div className="rounded-md bg-red-600 px-3 py-2 text-sm text-white">{errorMessage}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="w-full rounded-lg bg-amber-400 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </section>
  )
}

export default LoginFormCard
