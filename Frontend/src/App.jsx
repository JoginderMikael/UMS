import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './features/public/pages/HomePage'
import LoginPage from './features/public/pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
