import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

type LoginFormData = {
  email: string
  password: string
}

const initialFormState: LoginFormData = {
  email: '',
  password: '',
}

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>(initialFormState)

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetForm(): void {
    setFormData(initialFormState)
  }

  const canSubmit = useMemo(
    () => Boolean(formData.email.trim()) && Boolean(formData.password.trim()),
    [formData.email, formData.password],
  )

  return {
    formData,
    canSubmit,
    handleInputChange,
    resetForm,
  }
}