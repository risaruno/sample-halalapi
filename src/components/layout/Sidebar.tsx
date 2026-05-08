import { NavLink } from 'react-router-dom'
import { ShoppingBag, Package } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

interface SidebarProps {
  onNavClick?: () => void
}

export default function Sidebar({ onNavClick }: SidebarProps) {
  const { t } = useLanguage()

  const navItems = [
    { to: '/products', icon: ShoppingBag, label: t.sidebar.navProducts, sublabel: t.sidebar.navProductsSub },
    { to: '/orders',   icon: Package,     label: t.sidebar.navOrders,   sublabel: t.sidebar.navOrdersSub   },
  ]

  return (
    <aside className="w-64 h-full flex-shrink-0 bg-teal-950 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-400 rounded-lg flex items-center justify-center text-teal-950 font-display font-bold text-lg">
            H
          </div>
          <div>
            <p className="font-display font-bold text-white leading-tight">HalalAPI</p>
            <p className="text-teal-400 text-xs">{t.sidebar.partnerPortal}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, sublabel }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-300 hover:bg-teal-900 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={isActive ? 'text-teal-200' : 'text-teal-400 group-hover:text-teal-200'}
                />
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-teal-500 leading-tight">{sublabel}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Halal brand accent — geometric Islamic pattern */}
      <div className="px-6 py-5 border-t border-teal-800">
        <div className="flex items-center gap-2 opacity-60">
          {/* Simplified crescent SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-teal-400">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
          <div>
            <p className="text-xs text-teal-400 font-medium">{t.sidebar.halalCertified}</p>
            <p className="text-xs text-teal-600">{t.sidebar.halalSubtext}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
