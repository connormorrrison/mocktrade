import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button2 } from '@/components/button-2'
import { House, Wallet, TrendingUp, FileText, User, LogOut, Eye, Trophy, Bug } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useUser()
  
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
    <div className="relative h-full">
      <Card
        className="
          relative flex flex-col
          w-52 p-4 rounded-xl !border-[oklch(1_0_0_/_10%)] dark:bg-input/30 shadow-none
        "
        style={{
          height: 'calc(100vh - 144px)',
          marginTop: '32px',
          marginLeft: '32px'
        }}
      >
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

        {/* Bottom buttons stacked vertically */}
        <div className="mt-4 flex flex-col gap-2 items-start">
          <Button2>
            <Bug className="!text-orange-600" />
            Report
          </Button2>
          <Button2 onClick={logout}>
            <LogOut className="!text-red-600" />
            Logout
          </Button2>
        </div>
      </Card>
    </div>
  )
}