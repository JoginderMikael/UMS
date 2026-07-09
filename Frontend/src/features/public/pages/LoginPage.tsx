import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoginFormCard from '../components/LoginFormCard'
import { roleRouteMap } from '../constants/authConstants'
import { useLoginForm } from '../hooks/useLoginForm'
import { fetchCurrentUser, loginWithCredentials } from '../services/authService'
import { saveCurrentUser, saveToken } from '../../../utils/session'

function LoginPage() {
  const navigate = useNavigate()
  const { formData, canSubmit, handleInputChange, resetForm } = useLoginForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const normalizedEmail = useMemo(() => formData.email.trim(), [formData.email])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const loginData = await loginWithCredentials(normalizedEmail, formData.password)
      saveToken(loginData.token)

      const user = await fetchCurrentUser(loginData.token)
      saveCurrentUser(user)

      const roleKey = String(user?.role || '').toUpperCase()
      const destination = roleRouteMap[roleKey] ?? '/'
      navigate(destination, { replace: true })
    } catch (error) {
      console.error('Login flow failed:', error)
      setErrorMessage('Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
      resetForm()
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 md:px-8 md:py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-white/15 bg-white/8 p-8 text-white shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
          <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Welcome Back
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Continue to the UMS Portal
          </h1>
          <p className="mt-4 max-w-xl text-slate-200/95 md:text-lg">
            Sign in to access your dashboard, courses, registrations, and academic tools
            tailored to your role.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100">Admin Controls</div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100">Student Services</div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100">Faculty Tools</div>
          </div>

          <p className="mt-8 text-sm text-slate-300">
            Need to explore first?{' '}
            <Link className="font-semibold text-cyan-200 underline decoration-cyan-200/50 underline-offset-4" to="/">
              Back to Home
            </Link>
          </p>
        </section>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <LoginFormCard
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </main>
  )
}

export default LoginPage