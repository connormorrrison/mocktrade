import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button2 } from '@/components/button-2'
import { House, Wallet, TrendingUp, FileText, User, LogOut, Eye, Trophy } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  
  const menuItems = [
    { name: 'Home', path: '/', icon: House },
    { name: 'Portfolio', path: '/portfolio', icon: Wallet },
    { name: 'Trade', path: '/trade', icon: TrendingUp },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Transactions', path: '/transactions', icon: FileText },
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
          height: 'calc(100vh - 64px)',
          marginTop: '32px',
          marginLeft: '32px'
        }}
      >
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const IconComponent = item.icon
              const isActive = location.pathname === item.path
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg !font-medium transition-colors ${
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
        
        {/* Logout button at bottom */}
        <div className="mt-4 flex justify-start">
          <Button2>
            <LogOut className="!text-red-600" />
            Logout
          </Button2>
        </div>
      </Card>
    </div>
  )
}
