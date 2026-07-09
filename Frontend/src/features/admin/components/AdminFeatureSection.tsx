type AdminFeatureSectionProps = {
  title?: string
}

function AdminFeatureSection({ title = 'Admin Feature' }: AdminFeatureSectionProps) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4">{title}</section>
}

export default AdminFeatureSection