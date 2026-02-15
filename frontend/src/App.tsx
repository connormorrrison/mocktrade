import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/ThemeProvider"
import { UserProvider, useUser } from "@/contexts/UserContext"
import { ScrollToTop } from "@/components/ScrollToTop"
import AppLayout from "@/components/AppLayout"
import HomePage from "@/pages/HomePage"
import PortfolioPage from "@/pages/PortfolioPage"
import TradePage from "@/pages/TradePage"
import WatchlistPage from "@/pages/WatchlistPage"
import LeaderboardPage from "@/pages/LeaderboardPage"
import ActivityPage from "@/pages/ActivityPage"
import ProfilePage from "@/pages/ProfilePage"
import UserProfilePage from "@/pages/UserProfilePage"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import LandingPage from "@/pages/LandingPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return <div className="h-screen bg-black" />;
  }

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* landing and auth routes - no sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* main app routes - with sidebar, protected */}
      <Route path="/home" element={
        <ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/portfolio" element={
        <ProtectedRoute><AppLayout><PortfolioPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/trade" element={
        <ProtectedRoute><AppLayout><TradePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/trade/:symbol" element={
        <ProtectedRoute><AppLayout><TradePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/watchlist" element={
        <ProtectedRoute><AppLayout><WatchlistPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard/:username" element={
        <ProtectedRoute><AppLayout><UserProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/activity" element={
        <ProtectedRoute><AppLayout><ActivityPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
