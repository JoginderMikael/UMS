type StudentFeatureSectionProps = {
  title?: string
}

function StudentFeatureSection({ title = 'Student Feature' }: StudentFeatureSectionProps) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4">{title}</section>
}

export default StudentFeatureSection