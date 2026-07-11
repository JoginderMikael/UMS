import AdminFeatureSection from '../components/AdminFeatureSection'

function AcademicYearPage() {
  return (
    <AdminFeatureSection
      title="Academic Years"
      description="Manage year calendars, semester windows, and rollovers with clear lifecycle controls."
      highlights={[
        'Academic year timeline overview',
        'Semester start/end configuration',
        'Activation and archive controls',
        'Validation before year transitions',
      ]}
    />
  )
}

export default AcademicYearPage