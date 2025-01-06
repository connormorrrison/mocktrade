// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import PortfolioPage from './pages/PortfolioPage'
import TradePage from './pages/TradePage'
import TransactionPage from './pages/TransactionsPage'
import ProfilePage from './pages/ProfilePage'
import DashboardLayout from './components/DashboardLayout'

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  console.log('ProtectedRoute: Checking token:', !!token);
  
  if (!token) {
    console.log('ProtectedRoute: No token, redirecting to login');
    return <Navigate to="/login" replace />
  }
  
  console.log('ProtectedRoute: Token found, rendering children');
  return <DashboardLayout>{children}</DashboardLayout>
}

// Add "export default" here
export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trade"
            element={
              <ProtectedRoute>
                <TradePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}