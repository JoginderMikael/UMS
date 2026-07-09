import type { ReactNode } from 'react'
import { text } from './helpers'

export function RolePill({ role }: { role: string }) {
  const value = role.toUpperCase() || 'UNKNOWN'
  const className =
    value === 'ADMIN'
      ? 'border-violet-300/40 bg-violet-500/20 text-violet-100'
      : value === 'FACULTY'
        ? 'border-sky-300/40 bg-sky-500/20 text-sky-100'
        : 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'

  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${className}`}>{value}</span>
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-violet-100">{text(value)}</p>
    </article>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  compact = false,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  compact?: boolean
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<string | { value: string; label: string }>
  placeholder?: string
  compact?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) =>
        typeof option === 'string' ? (
          <option key={option} value={option}>
            {option}
          </option>
        ) : (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ),
      )}
    </select>
  )
}

export function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
    >
      {children}
    </button>
  )
}

export function SmallButton({
  onClick,
  children,
  kind,
}: {
  onClick: () => void
  children: ReactNode
  kind: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
}) {
  const style =
    kind === 'primary'
      ? 'border-violet-300/40 bg-violet-500/20 text-violet-100'
      : kind === 'secondary'
        ? 'border-sky-300/40 bg-sky-500/15 text-sky-100'
        : kind === 'danger'
          ? 'border-rose-300/40 bg-rose-500/15 text-rose-100'
          : kind === 'success'
            ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100'
            : 'border-slate-600 bg-slate-800/70 text-slate-200'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition hover:brightness-110 ${style}`}
    >
      {children}
    </button>
  )
}
