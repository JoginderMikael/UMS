import AdminFeatureSection from '../components/AdminFeatureSection'

function AdminProfilePage() {
  return (
    <AdminFeatureSection
      title="Admin Profile"
      description="Manage administrator identity, permissions context, and security preferences in one place."
      highlights={[
        'Profile and contact details',
        'Role and access visibility',
        'Security preferences and session controls',
        'Activity and audit-oriented context',
      ]}
    />
  )
}

export default AdminProfilePage