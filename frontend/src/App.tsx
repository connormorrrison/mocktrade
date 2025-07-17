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
import logo from "@/assets/mocktrade-logo.png"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <BrowserRouter>
          <div className="grid grid-cols-[auto_1fr] h-screen">
            <div className="flex flex-col">
              <div className="flex justify-center" style={{ marginLeft: '32px', marginTop: '32px' }}>
                <img src={logo} alt="MockTrade" className="h-12 w-auto" />
              </div>
              <Sidebar />
            </div>
            <main className="flex justify-center items-start py-8 overflow-y-auto relative" style={{ width: 'calc(100vw - 256px)', paddingLeft: '32px', paddingRight: '16px' }}>
              <Profile />
              <div style={{ width: 'calc(100vw - 32px)' }}>
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
            </main>
          </div>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App