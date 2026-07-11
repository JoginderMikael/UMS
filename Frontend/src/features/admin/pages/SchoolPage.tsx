import AdminFeatureSection from '../components/AdminFeatureSection'

function SchoolPage() {
  return (
    <AdminFeatureSection
      title="Schools"
      description="Handle school creation, updates, and archival using a unified administrative workspace experience."
      highlights={[
        'Active vs archived schools',
        'Code uniqueness and validation',
        'Ownership and dependency hints',
        'Fast jump to departments/programs',
      ]}
    />
  )
}

export default SchoolPage