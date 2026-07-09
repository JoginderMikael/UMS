type PublicFeatureSectionProps = {
  title?: string
}

function PublicFeatureSection({ title = 'Public Feature' }: PublicFeatureSectionProps) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4">{title}</section>
}

export default PublicFeatureSection