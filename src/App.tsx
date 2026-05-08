import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import AppShell from './components/layout/AppShell'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'

function LoadingScreen() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-200 font-display font-semibold text-lg">
          {t.app.loadingMessage}
        </p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  const { t } = useLanguage()
  const apiKey = import.meta.env.VITE_PARTNER_API_KEY as string
  const keyPrefix = apiKey ? apiKey.substring(0, 16) + '…' : '(not set)'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-950 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="font-display text-xl font-bold text-gray-900 mb-2">
          {t.app.authFailed}
        </h1>
        <p className="text-gray-600 mb-4 text-sm">{message}</p>
        <div className="bg-gray-50 rounded-lg p-3 text-left">
          <p className="text-xs text-gray-500 font-mono">{t.app.authKeyLabel} {keyPrefix}</p>
          <p className="text-xs text-gray-400 mt-1">{t.app.authKeyHint}</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { isReady, error, initialize } = useAuthStore()
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  useEffect(() => {
    initialize().then(() => setLastSynced(new Date()))
  }, [initialize])

  if (!isReady) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

  return (
    <AppShell lastSynced={lastSynced} onSyncUpdate={setLastSynced}>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage onSyncUpdate={setLastSynced} />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </AppShell>
  )
}

export function AppWithProviders() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  )
}
