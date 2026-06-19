import './App.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage'
import EmployeePages from './pages/EmployeesPage/EmployeesPage'
import Layout from './components/Layout/Layout'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/employees" element={<EmployeePages />} />
            <Route path="*" element={<Navigate to="/employees" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
