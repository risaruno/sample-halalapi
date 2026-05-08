import { useLanguage } from '../../contexts/LanguageContext'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onChange: (category: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-teal-700 text-white'
            : 'bg-white text-gray-600 border border-gray-300 hover:border-teal-500 hover:text-teal-700'
        }`}
      >
        {t.products.allCategories}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === selected ? null : cat)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-teal-700 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-teal-500 hover:text-teal-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
