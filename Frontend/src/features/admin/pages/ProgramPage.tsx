import AdminFeatureSection from '../components/AdminFeatureSection'

function ProgramPage() {
  return (
    <AdminFeatureSection
      title="Programs"
      description="Configure program structures, ownership, and curriculum alignment with clearer information density."
      highlights={[
        'Program lifecycle and status',
        'Curriculum mapping checkpoints',
        'Department ownership clarity',
        'Quick links to course associations',
      ]}
    />
  )
}

export default ProgramPage