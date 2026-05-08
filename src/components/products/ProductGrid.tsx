import type { Product } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-2/3 mt-2" />
        <div className="h-9 bg-gray-200 rounded mt-3" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-gray-600">{t.products.noResults}</p>
          <p className="text-sm text-gray-400">{t.products.noResultsDesc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
