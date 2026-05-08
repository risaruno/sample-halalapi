import { NavLink } from 'react-router-dom'
import { ShoppingBag, Package } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function MobileNav() {
  const { t } = useLanguage()

  const navItems = [
    { to: '/products', icon: ShoppingBag, label: t.mobileNav.products },
    { to: '/orders',   icon: Package,     label: t.mobileNav.orders   },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20 flex">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-teal-700' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} className={isActive ? 'text-teal-700' : 'text-gray-400'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
