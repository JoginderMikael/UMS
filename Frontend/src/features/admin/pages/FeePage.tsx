import AdminFeatureSection from '../components/AdminFeatureSection'

function FeePage() {
  return (
    <AdminFeatureSection
      title="Fees"
      description="Manage fee structures, due windows, and financial exceptions in a cleaner billing workspace."
      highlights={[
        'Fee matrix by program and level',
        'Payment status and arrears insight',
        'Waivers, penalties, and overrides',
        'Reconciliation-ready reporting',
      ]}
    />
  )
}

export default FeePage