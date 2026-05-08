import type { ReactNode } from 'react'
import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import CartDrawer from '../cart/CartDrawer'

interface AppShellProps {
  children: ReactNode
  lastSynced: Date | null
  onSyncUpdate: (d: Date) => void
}

export default function AppShell({ children, lastSynced, onSyncUpdate }: AppShellProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — always visible on lg+, slide-over on mobile */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar onNavClick={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          lastSynced={lastSynced}
          onCartClick={() => setCartOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {/* pb-16 on mobile to clear the bottom nav bar */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileNav />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onSyncUpdate={onSyncUpdate} />
    </div>
  )
}
