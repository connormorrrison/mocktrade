import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"

// Placeholder pages
function HomePage() {
  return <div className="p-8"></div>
}

function PortfolioPage() {
  return <div className="p-8"></div>
}

function TradePage() {
  return <div className="p-8"></div>
}

function TransactionsPage() {
  return <div className="p-8"></div>
}

function ProfilePage() {
  return <div className="p-8"></div>
}

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
