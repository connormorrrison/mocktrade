import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import HomePage from "@/pages/HomePage"
import PortfolioPage from "@/pages/PortfolioPage"
import TradePage from "@/pages/TradePage"
import TransactionsPage from "@/pages/TransactionsPage"
import ProfilePage from "@/pages/ProfilePage"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
