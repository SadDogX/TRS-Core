import './App.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import EmployeePages from './pages/EmployeesPage'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employees" element={<EmployeePages />} />
          <Route path="*" element={<Navigate to="/employees" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
