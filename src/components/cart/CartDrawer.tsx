import { X, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useLanguage } from '../../contexts/LanguageContext'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onSyncUpdate: (d: Date) => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items } = useCartStore()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-display font-bold text-gray-900 text-lg">
            {t.cart.title} ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={28} />}
              title={t.cart.empty}
              description={t.cart.emptyDesc}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 space-y-4">
            <CartSummary />
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
            >
              {t.cart.checkout}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
