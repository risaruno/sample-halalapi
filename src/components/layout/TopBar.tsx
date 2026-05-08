import { ShoppingCart, RefreshCw, Menu } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useLanguage } from '../../contexts/LanguageContext'
import type { Tier } from '../../types'

const TIER_STYLES: Record<Tier, string> = {
  Gold:   'bg-amber-100 text-amber-800 border border-amber-300',
  Silver: 'bg-gray-100 text-gray-700 border border-gray-300',
  Bronze: 'bg-orange-100 text-orange-800 border border-orange-300',
}

interface TopBarProps {
  lastSynced: Date | null
  onCartClick: () => void
  onMenuClick: () => void
}

export default function TopBar({ lastSynced, onCartClick, onMenuClick }: TopBarProps) {
  const { partner } = useAuthStore()
  const totalItems = useCartStore((s) => s.totalItems)
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 flex-shrink-0">
      {/* Left: hamburger (mobile) + partner info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex-shrink-0"
          aria-label={t.topbar.openMenu}
        >
          <Menu size={20} />
        </button>

        {partner && (
          <>
            <span className="font-display font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">
              {partner.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${TIER_STYLES[partner.tier]}`}
            >
              {partner.tier}
            </span>
          </>
        )}
      </div>

      {/* Right: last synced + language switcher + cart */}
      <div className="flex items-center gap-2 sm:gap-4">
        {lastSynced && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <RefreshCw size={12} />
            <span>{t.topbar.synced} {formatDistanceToNow(lastSynced, { addSuffix: true })}</span>
          </div>
        )}

        {/* Language switcher */}
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
          {(['en', 'ko', 'id'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 text-xs font-semibold transition-colors ${
                lang === l
                  ? 'bg-teal-700 text-white'
                  : 'text-gray-500 hover:text-teal-700 hover:bg-teal-50'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={onCartClick}
          className="relative p-2 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
          aria-label={t.topbar.openCart}
        >
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
