import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/UserContext"
import Sidebar from "@/components/sidebar"
import Profile from "@/components/profile"
import BlackBox from "@/components/blackbox"
import HomePage from "@/pages/HomePage"
import PortfolioPage from "@/pages/PortfolioPage"
import TradePage from "@/pages/TradePage"
import TransactionsPage from "@/pages/TransactionsPage"
import ProfilePage from "@/pages/ProfilePage"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <BrowserRouter>
          <div className="grid grid-cols-[auto_1fr] h-screen">
            <Sidebar />
            <main className="flex justify-center items-start py-8 overflow-y-auto relative" style={{ width: 'calc(100vw - 256px)', paddingLeft: '32px', paddingRight: '16px' }}>
              <BlackBox />
              <Profile />
              <div style={{ width: 'calc(100vw - 32px)' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/trade" element={<TradePage />} />
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