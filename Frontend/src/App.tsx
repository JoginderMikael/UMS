import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnlyRoute, ProtectedRoute } from './app/guards/routeGuards'
import AdminLayout from './features/admin/components/AdminLayout'
import {
  AdminDashboardPage,
  AdminProfilePage,
} from './features/admin/pages'
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
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="academic-years" element={<AdminDashboardPage initialSection="cycle" />} />
        <Route path="schools" element={<AdminDashboardPage initialSection="schools" />} />
        <Route path="departments" element={<AdminDashboardPage initialSection="departments" />} />
        <Route path="programs" element={<AdminDashboardPage initialSection="programs" />} />
        <Route path="courses" element={<AdminDashboardPage initialSection="courses" />} />
        <Route path="enrollments" element={<AdminDashboardPage initialSection="overview" />} />
        <Route path="fees" element={<AdminDashboardPage initialSection="overview" />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Navigate to="/admin" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <Navigate to="/student" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <Navigate to="/faculty" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Navigate to="/admin" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <Navigate to="/student" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/*"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <Navigate to="/faculty" replace />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App