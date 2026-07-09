type FacultyFeatureSectionProps = {
  title?: string
}

function FacultyFeatureSection({ title = 'Faculty Feature' }: FacultyFeatureSectionProps) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4">{title}</section>
}

export default FacultyFeatureSection