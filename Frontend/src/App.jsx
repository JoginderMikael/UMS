import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'
import AcademicsPage from './features/public/pages/AcademicsPage'
import AdmissionsPage from './features/public/pages/AdmissionsPage'
import CampusLifePage from './features/public/pages/CampusLifePage'
import FacultyHomePage from './features/faculty/pages/FacultyHomePage'
import HomePage from './features/public/pages/HomePage'
import LoginPage from './features/public/pages/LoginPage'
import StudentDashboardPage from './features/student/pages/StudentDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/academics" element={<AcademicsPage />} />
      <Route path="/admissions" element={<AdmissionsPage />} />
      <Route path="/campus-life" element={<CampusLifePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/faculty" element={<FacultyHomePage />} />

      {/* Compatibility aliases while migration continues */}
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
