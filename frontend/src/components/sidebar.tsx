import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { House, ChartCandlestick, ArrowLeftRight, FileText, User } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { name: 'Home', path: '/', icon: House },
    { name: 'Portfolio', path: '/portfolio', icon: ChartCandlestick },
    { name: 'Trade', path: '/trade', icon: ArrowLeftRight },
    { name: 'Transactions', path: '/transactions', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <div className="relative h-full">
      <Card
        className="
          relative flex flex-col
          w-52 p-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-background/30 dark:bg-input/30 shadow-none
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
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-normal !text-white hover:bg-accent hover:!text-white ${
                      isActive ? 'bg-accent' : ''
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
      </Card>
    </div>
  )
}