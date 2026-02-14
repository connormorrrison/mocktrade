import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/ThemeProvider"
import { UserProvider, useUser } from "@/contexts/UserContext"
import Sidebar from "@/components/Sidebar"
import Profile from "@/components/Profile"
import { ScrollToTop } from "@/components/ScrollToTop"
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

// Define the precise dimensions based on your sidebar
const SIDEBAR_COLUMN_VISUAL_WIDTH = '240px';
const CONTENT_GAP_WIDTH = '48px';
const RIGHT_SCREEN_MARGIN_WIDTH = '48px';

// Protected Route component that redirects to landing page when not authenticated
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
      {/* Landing and auth routes - no sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Main app routes - with sidebar, protected */}
      <Route path="/home" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><HomePage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/portfolio" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><PortfolioPage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/trade" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><TradePage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />

      <Route path="/trade/:symbol" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><TradePage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/watchlist" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><WatchlistPage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><LeaderboardPage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/activity" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><ActivityPage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><ProfilePage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      {/* User profile routes - with sidebar, protected */}
      <Route path="/leaderboard/:username" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2"><Profile /></div>
                <div className="mt-8"><UserProfilePage /></div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Main app routes - with sidebar, protected */}
      <Route path="/app/*" element={
        <ProtectedRoute>
          <div className={`grid h-screen overflow-hidden`}
               style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>
            <Sidebar />
            <div></div>
            <main className="flex flex-col min-w-0 h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                <div className="pt-2">
                  <Profile />
                </div>
                <div className="mt-8">
                  <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/trade" element={<TradePage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        </ProtectedRoute>
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