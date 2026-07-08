import { useMemo, useState } from 'react'
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

  async function handleSubmit(event) {
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
    <main className="flex min-h-screen items-center justify-center bg-linear-to-r from-[#0b3c5d] to-[#3282b8] px-4 py-8">
      <div className="w-full max-w-md">
        <LoginFormCard
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          errorMessage={errorMessage}
        />

        <p className="mt-5 text-center text-sm text-white/90">
          <Link className="underline decoration-white/70 underline-offset-4" to="/">
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage
