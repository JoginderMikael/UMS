type EmptyStateProps = {
  message?: string
}

function EmptyState({ message = 'No data available yet.' }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-600">
      {message}
    </div>
  )
}

export default EmptyState