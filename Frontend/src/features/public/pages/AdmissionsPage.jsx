import FeaturePanel from '../components/FeaturePanel'
import PublicPageShell from '../components/PublicPageShell'

const admissionSteps = [
  {
    title: 'Apply Online',
    description:
      'Complete your application through our digital admissions portal with easy document uploads and progress tracking.',
    badge: 'Step 1',
    items: ['Simple online form', 'Secure document upload', 'Application status tracking'],
  },
  {
    title: 'Review & Guidance',
    description:
      'Our admissions advisors review your profile holistically and support you with scholarships, program fit, and onboarding.',
    badge: 'Step 2',
    items: ['Transparent review criteria', 'Scholarship guidance', 'Direct advisor support'],
  },
  {
    title: 'Offer & Enrollment',
    description:
      'Receive your admission decision, accept your offer, and complete enrollment with a personalized onboarding journey.',
    badge: 'Step 3',
    items: ['Fast decision updates', 'Enrollment checklist', 'Welcome orientation'],
  },
]

function AdmissionsPage() {
  return (
    <PublicPageShell
      eyebrow="Admissions"
      title="Your Journey to Aura Heights Starts Here"
      subtitle="We make admissions transparent, supportive, and student-centered—from first application to first class."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {admissionSteps.map((item) => (
          <FeaturePanel key={item.title} {...item} />
        ))}
      </div>
    </PublicPageShell>
  )
}

export default AdmissionsPage
