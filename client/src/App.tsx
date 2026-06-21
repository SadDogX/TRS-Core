import './App.css'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage'
import EmployeePages from './pages/EmployeesPage/EmployeesPage'
import Layout from './components/Layout/Layout'
import TeamPage from './pages/TeamPage/TeamPage'
import WorkPage from './pages/WorkPage/WorkPage'

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/employees" element={<EmployeePages />} />
            <Route path="/teams" element={<TeamPage/>} />
            <Route path="/works" element={<WorkPage/>} />
            <Route path="/bases" element={<div>Bases</div>} />
            <Route path="/positions" element={<div>Positions</div>} />
            <Route path="/profile" element={<div>Profile</div>} />
            <Route path="*" element={<Navigate to="/employees" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
