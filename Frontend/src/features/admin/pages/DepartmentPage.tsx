import AdminFeatureSection from '../components/AdminFeatureSection'

function DepartmentPage() {
  return (
    <AdminFeatureSection
      title="Departments"
      description="Organize academic units with cleaner controls for structure, ownership, and downstream mapping."
      highlights={[
        'Department hierarchy management',
        'School-based assignment workflow',
        'Status tracking and audit context',
        'Fast navigation to related programs',
      ]}
    />
  )
}

export default DepartmentPage