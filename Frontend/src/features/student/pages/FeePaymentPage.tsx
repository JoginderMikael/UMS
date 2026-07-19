import { useMemo, useState } from 'react'
import StudentFeatureSection from '../components/StudentFeatureSection'
import { formatCurrency, formatSignedCurrency, payFees } from '../services/studentServices'
import { useStudentPortalContext } from '../services/useStudentPortalContext'

function FeePaymentPage() {
  const { token, profile, academic, feeStatus, refreshFeeStatus, loading, error } = useStudentPortalContext()
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('Enter amount paid, then submit.')
  const [busy, setBusy] = useState(false)

  const studentId = String(profile?.studentId || profile?.userId || '')
  const semesterId = String(academic?.activeSemesterId || '')

  const parsedAmount = useMemo(() => Number(amount), [amount])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    if (!token || !studentId || !semesterId) {
      setStatus('Unable to process payment: missing student or semester context.')
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setStatus('Enter a valid amount greater than 0.')
      return
    }

    setBusy(true)
    setStatus('Submitting fee payment...')
    try {
      await payFees(token, studentId, semesterId, parsedAmount)
      await refreshFeeStatus()
      setAmount('')
      setStatus('Fee payment recorded successfully.')
    } catch (paymentError) {
      setStatus(paymentError instanceof Error ? paymentError.message : 'Failed to submit fee payment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <StudentFeatureSection title="Current fee status" subtitle="Live fee summary for active semester and academic year.">
        {loading ? <p className="text-sm text-slate-300">Loading fee status...</p> : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Required Amount</p>
            <p className="mt-1 font-semibold text-white">{formatCurrency(feeStatus?.requiredAmount || 0)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Amount Paid</p>
            <p className="mt-1 font-semibold text-white">{formatCurrency(feeStatus?.amountPaid || 0)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Balance</p>
            <p className="mt-1 font-semibold text-white">{formatSignedCurrency(feeStatus?.balance || 0)}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Fee Cleared</p>
            <p className={`mt-1 font-semibold ${feeStatus?.cleared ? 'text-emerald-300' : 'text-amber-200'}`}>
              {feeStatus?.cleared ? 'Yes' : 'No'}
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Semester</p>
            <p className="mt-1 font-semibold text-white">{academic?.activeSemesterName || 'N/A'}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Academic Year</p>
            <p className="mt-1 font-semibold text-white">{academic?.activeAcademicYearName || 'N/A'}</p>
          </article>
        </div>
      </StudentFeatureSection>

      <StudentFeatureSection title="Submit fee payment" subtitle="Record payment for the active semester.">
        <p className="mb-3 text-sm text-cyan-100">{status}</p>
        <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm text-slate-300">
            Amount (KES)
            <input
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 5000"
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-hidden ring-cyan-300/40 focus:ring-1"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </StudentFeatureSection>
    </div>
  )
}

export default FeePaymentPage