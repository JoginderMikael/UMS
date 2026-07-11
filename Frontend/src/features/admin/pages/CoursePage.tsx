import AdminFeatureSection from '../components/AdminFeatureSection'

function CoursePage() {
  return (
    <AdminFeatureSection
      title="Courses"
      description="Create and maintain the course catalog with improved visibility for credits, mappings, and status."
      highlights={[
        'Catalog search and filters',
        'Credit and prerequisite editing',
        'Department-level ownership',
        'Bulk import/export readiness',
      ]}
    />
  )
}

export default CoursePage