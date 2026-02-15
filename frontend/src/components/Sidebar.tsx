import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button2 } from '@/components/Button2'
import { House, Wallet, TrendingUp, FileText, User, LogOut, Eye, Trophy, Bug } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { ReportBugDialog } from '@/components/ReportBugDialog'
import logo from '@/assets/mocktrade-logo.png'

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation()
  const { logout } = useUser()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const menuItems = [
    { name: 'Home', path: '/home', icon: House },
    { name: 'Portfolio', path: '/portfolio', icon: Wallet },
    { name: 'Trade', path: '/trade', icon: TrendingUp },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Activity', path: '/activity', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <div
      className="flex flex-col h-full w-full p-8"
    >
      {/* logo */}
      <div className="flex justify-center mb-6">
        <Link to="/home">
          <img src={logo} alt="MockTrade" className="h-12 w-auto cursor-pointer" />
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const IconComponent = item.icon
            const isActive = item.path === '/leaderboard'
              ? location.pathname.startsWith('/leaderboard')
              : location.pathname === item.path
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-4 px-4 py-2 rounded-xl text-lg !font-normal transition-colors ${
                    isActive
                      ? '!bg-blue-600/8 !text-blue-600'
                      : '!text-white hover:bg-blue-600/5'
                  }`}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* bottom buttons stacked vertically */}
      <div className="mt-4 flex flex-col gap-2 items-start">
        <Button2 onClick={() => setIsReportDialogOpen(true)}>
          <Bug className="!text-orange-600" />
          Report
        </Button2>
        <Button2 onClick={logout}>
          <LogOut className="!text-red-600" />
          Logout
        </Button2>
      </div>

      {/* report bug dialog */}
      <ReportBugDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </div>
  )
}