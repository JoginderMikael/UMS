import { useMemo, useState } from 'react'

const initialFormState = {
  email: '',
  password: '',
}

export function useLoginForm() {
  const [formData, setFormData] = useState(initialFormState)

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetForm() {
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
