import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/UserContext"
import Sidebar from "@/components/sidebar"
import Profile from "@/components/profile"
import HomePage from "@/pages/HomePage"
import PortfolioPage from "@/pages/PortfolioPage"
import TradePage from "@/pages/TradePage"
import WatchlistPage from "@/pages/WatchlistPage"
import LeaderboardPage from "@/pages/LeaderboardPage"
import TransactionsPage from "@/pages/TransactionsPage"
import ProfilePage from "@/pages/ProfilePage"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import logo from "@/assets/mocktrade-logo.png"

// Define the precise dimensions based on your sidebar
const SIDEBAR_COLUMN_VISUAL_WIDTH = '240px'; // 208px (w-52) + 32px (margin-left)
const CONTENT_GAP_WIDTH = '48px';
const RIGHT_SCREEN_MARGIN_WIDTH = '48px';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no sidebar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Main app routes - with sidebar */}
            <Route path="/*" element={
              <div className={`grid h-screen overflow-hidden`}
                   style={{ gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})` }}>

                <div className="flex flex-col">
                  <div className="flex justify-center" style={{ marginLeft: '32px', marginTop: '32px' }}>
                    <img src={logo} alt="MockTrade" className="h-12 w-auto" />
                  </div>
                  <Sidebar />
                </div>

                {/* This empty div is the 32px gap */}
                <div></div>

                <main className="flex flex-col min-w-0 h-full overflow-hidden">
                  <div className="flex-1 overflow-y-auto min-w-0 pb-8">
                    <div className="pt-8">
                      <Profile />
                    </div>
                    <div className="mt-8">
                      <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/portfolio" element={<PortfolioPage />} />
                      <Route path="/trade" element={<TradePage />} />
                      <Route path="/watchlist" element={<WatchlistPage />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/transactions" element={<TransactionsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      </Routes>
                    </div>
                  </div>
                </main>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App