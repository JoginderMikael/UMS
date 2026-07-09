import FeaturePanel from '../components/FeaturePanel'
import PublicPageShell from '../components/PublicPageShell'

const academicHighlights = [
  {
    title: 'Schools & Programs',
    description:
      'Discover multidisciplinary schools offering industry-aligned programs in STEM, Business, Health Sciences, and Humanities.',
    badge: 'Curriculum',
    items: ['80+ accredited programs', 'Flexible pathways', 'Project-based learning'],
  },
  {
    title: 'Research & Innovation',
    description:
      'Students and faculty collaborate on impactful research solving local and global challenges through innovation hubs and labs.',
    badge: 'Innovation',
    items: ['Interdisciplinary labs', 'Faculty mentorship', 'Real-world grants & showcases'],
  },
  {
    title: 'Learning Experience',
    description:
      'A blend of modern classrooms, digital tools, and experiential learning designed to build confidence and career readiness.',
    badge: 'Experience',
    items: ['Hybrid-ready classrooms', 'Capstone projects', 'Career-guided modules'],
  },
]

function AcademicsPage() {
  return (
    <PublicPageShell
      eyebrow="Academics"
      title="Excellence in Teaching, Research, and Learning"
      subtitle="At Aura Heights University, academics are intentionally designed around mastery, mentorship, and meaningful outcomes."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {academicHighlights.map((item) => (
          <FeaturePanel key={item.title} {...item} />
        ))}
      </div>
    </PublicPageShell>
  )
}

export default AcademicsPage