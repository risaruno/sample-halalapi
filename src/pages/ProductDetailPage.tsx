import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCartStore } from '../stores/cartStore'
import { useLanguage } from '../contexts/LanguageContext'
import PriceTag from '../components/ui/PriceTag'
import toast from 'react-hot-toast'

const LANG_LABELS: Record<string, Record<string, string>> = {
  en: { en: 'English', id: 'Bahasa Inggris', ko: '영어' },
  id: { en: 'Indonesian', id: 'Bahasa Indonesia', ko: '인도네시아어' },
  ko: { en: 'Korean', id: 'Bahasa Korea', ko: '한국어' },
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const { addItem, items } = useCartStore()
  const { lang, t } = useLanguage()
  const [activeImage, setActiveImage] = useState(0)

  const product = products.find((p) => p.id === id)
  const inCart = product ? items.some((i) => i.product.id === product.id) : false
  const outOfStock = product ? product.stock_qty === 0 : false
  const displayName = product ? (product.translations?.[lang] ?? product.name) : ''

  const handleAdd = () => {
    if (!product) return
    addItem(product)
    toast.success(t.products.addedToCart(displayName))
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24" />
        <div className="h-72 bg-gray-200 rounded-xl" />
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium text-gray-600">Product not found</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 text-teal-700 text-sm hover:underline"
        >
          ← Back to products
        </button>
      </div>
    )
  }

  const images = (product.images ?? []).filter(Boolean)
  const hasCompare = product.compare_at_price != null && product.compare_at_price > product.selling_price
  const translations = product.translations

  // Build list of available language names
  const nameRows: { langKey: string; label: string; value: string }[] = []
  for (const key of ['en', 'id', 'ko'] as const) {
    const val = translations?.[key]
    if (val) {
      nameRows.push({ langKey: key, label: LANG_LABELS[key][lang] ?? key.toUpperCase(), value: val })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft size={16} />
        {t.productDetail.back}
      </button>

      {/* Image gallery */}
      <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[activeImage]}
              alt={displayName}
              className="w-full h-72 object-cover"
            />
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-teal-600' : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-72 flex items-center justify-center text-gray-300">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-2">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <p className="text-sm">{t.productDetail.noImage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Title + badges */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="font-display text-xl font-bold text-gray-900 leading-snug">
            {displayName}
          </h1>
          {product.is_halal && (
            <span className="flex-shrink-0 bg-teal-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              🌙 {t.productDetail.halal}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {t.productDetail.sku}: <span className="font-mono">{product.sku}</span>
        </p>
        <p className="text-sm text-teal-600 font-medium mt-0.5">{product.category}</p>
      </div>

      {/* Stock status */}
      <div>
        {outOfStock ? (
          <span className="inline-block bg-red-50 text-red-600 text-sm font-medium px-3 py-1 rounded-full border border-red-200">
            {t.productDetail.outOfStock}
          </span>
        ) : product.stock_qty <= 10 ? (
          <span className="inline-block bg-amber-50 text-amber-700 text-sm font-medium px-3 py-1 rounded-full border border-amber-200">
            {t.productDetail.lowStock(product.stock_qty)}
          </span>
        ) : (
          <span className="inline-block bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full border border-green-200">
            {t.productDetail.inStock(product.stock_qty)}
          </span>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
        {hasCompare && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{t.productDetail.retailPrice}</span>
            <PriceTag amount={product.compare_at_price!} size="sm" strikethrough />
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{t.productDetail.sellingPrice}</span>
          <PriceTag amount={product.selling_price} size="lg" className="text-teal-700" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div>
            <span className="text-sm font-semibold text-gray-900">{t.productDetail.yourPrice}</span>
            <p className="text-xs text-gray-400 mt-0.5">{t.productDetail.yourPriceHint}</p>
          </div>
          <PriceTag amount={product.your_price} size="lg" className="text-green-600 font-bold" />
        </div>
      </div>

      {/* Product names in all languages */}
      {nameRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t.productDetail.productNames}
          </h2>
          {nameRows.map(({ langKey, label, value }) => (
            <div key={langKey} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-24 text-xs text-gray-400 font-medium pt-0.5">{label}</span>
              <span className={`text-sm text-gray-800 ${langKey === lang ? 'font-semibold text-teal-700' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div className="text-sm text-gray-600 leading-relaxed">
          {product.description}
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-colors ${
          inCart
            ? 'bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100'
            : outOfStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-teal-700 text-white hover:bg-teal-800'
        }`}
      >
        {inCart ? (
          <>
            <CheckCircle2 size={18} />
            {t.productDetail.inCart}
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            {t.productDetail.addToCart}
          </>
        )}
      </button>
    </div>
  )
}
