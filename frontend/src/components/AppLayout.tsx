import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import Sidebar from '@/components/Sidebar'
import Profile from '@/components/Profile'
import { ProfilePicture } from '@/components/ProfilePicture'
import logo from '@/assets/mocktrade-logo.png'
import icon from '@/assets/mocktrade-icon.png'

const SIDEBAR_COLUMN_VISUAL_WIDTH = '240px'
const CONTENT_GAP_WIDTH = '48px'
const RIGHT_SCREEN_MARGIN_WIDTH = '48px'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  if (isDesktop) {
    return (
      <div
        className="grid h-screen overflow-hidden"
        style={{
          gridTemplateColumns: `${SIDEBAR_COLUMN_VISUAL_WIDTH} ${CONTENT_GAP_WIDTH} calc(100vw - ${SIDEBAR_COLUMN_VISUAL_WIDTH} - ${CONTENT_GAP_WIDTH} - ${RIGHT_SCREEN_MARGIN_WIDTH})`,
        }}
      >
        <Sidebar />
        <div></div>
        <main className="flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto min-w-0 pb-8">
            <div className="pt-2"><Profile /></div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    )
  }

  // mobile layout
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-background">
        <button
          onClick={() => setDrawerOpen(true)}
          className="!flex !items-center !justify-center !p-2 !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <Link to="/home">
          <img src={icon} alt="MockTrade" className="h-8 w-8" />
        </Link>
        <Link to="/profile" className="p-1">
          <ProfilePicture size="sm" />
        </Link>
      </header>

      {/* main content */}
      <main className="flex-1 overflow-y-auto pt-18 pb-8">
        {children}
      </main>

      {/* drawer backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 !flex !items-center !justify-center !p-2 !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <div className="h-full pt-10 overflow-y-auto">
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>
    </div>
  )
}
