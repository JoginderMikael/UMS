import FeaturePanel from '../components/FeaturePanel'
import PublicPageShell from '../components/PublicPageShell'

const campusLifeThemes = [
  {
    title: 'Clubs & Communities',
    description:
      'Join student-led clubs, innovation circles, and cultural communities that help you grow beyond the classroom.',
    badge: 'Community',
    items: ['50+ active clubs', 'Leadership opportunities', 'Intercultural events'],
  },
  {
    title: 'Wellbeing & Support',
    description:
      'Comprehensive support services for wellness, counseling, career coaching, and peer mentorship.',
    badge: 'Support',
    items: ['Student wellness center', 'Academic coaching', 'Career readiness services'],
  },
  {
    title: 'Vibrant Campus Experience',
    description:
      'From hackathons to sports, campus life at AHU is designed to be energetic, inclusive, and memorable.',
    badge: 'Experience',
    items: ['Annual festivals', 'Sports & recreation', 'Innovation showcases'],
  },
]

function CampusLifePage() {
  return (
    <PublicPageShell
      eyebrow="Campus Life"
      title="A Campus Experience Built for Growth"
      subtitle="At AHU, student life is dynamic and purpose-driven—designed to help you belong, lead, and thrive."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {campusLifeThemes.map((item) => (
          <FeaturePanel key={item.title} {...item} />
        ))}
      </div>
    </PublicPageShell>
  )
}

export default CampusLifePage