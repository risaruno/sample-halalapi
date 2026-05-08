import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import ProductGrid from '../components/products/ProductGrid'
import CategoryFilter from '../components/products/CategoryFilter'

interface ProductsPageProps {
  onSyncUpdate: (d: Date) => void
}

export default function ProductsPage({ onSyncUpdate }: ProductsPageProps) {
  const { products, loading, error, lastSynced } = useProducts()
  const categories = useCategories(products)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Propagate sync time up to App so TopBar can display it
  useEffect(() => {
    if (lastSynced) onSyncUpdate(lastSynced)
  }, [lastSynced, onSyncUpdate])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = selectedCategory === null || p.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">상품 목록</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? '상품을 불러오는 중…' : `${products.length}개 상품 · 내 등급 할인가 적용됨`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          오류: {error}
        </div>
      )}

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="상품 검색 (이름, SKU)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Product grid */}
      <ProductGrid products={filtered} loading={loading} />
    </div>
  )
}
