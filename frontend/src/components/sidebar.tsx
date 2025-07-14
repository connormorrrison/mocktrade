import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'

export default function Sidebar() {

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Trade', path: '/trade' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Profile', path: '/profile' },
  ]

  return (
    <div className="relative h-full">
      <Card
        className="
          relative flex flex-col
          w-48 p-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-background/30 dark:bg-input/30 shadow-none
        "
        style={{
          height: 'calc(100vh - 64px)',
          marginTop: '32px',
          marginLeft: '32px'
        }}
      >
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map(item => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="block px-4 py-2 rounded-lg text-lg font-normal text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </div>
  )
}