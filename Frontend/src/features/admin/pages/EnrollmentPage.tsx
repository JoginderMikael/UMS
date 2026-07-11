import AdminFeatureSection from '../components/AdminFeatureSection'

function EnrollmentPage() {
  return (
    <AdminFeatureSection
      title="Enrollments"
      description="Track and manage student registration flows with operational visibility and exception handling."
      highlights={[
        'Enrollment funnel overview',
        'Pending approvals and blockers',
        'Program capacity snapshots',
        'Resolve failed registration cases',
      ]}
    />
  )
}

export default EnrollmentPage