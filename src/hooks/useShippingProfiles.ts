import { useState, useCallback } from 'react'
import type { ShippingProfile } from '../types'

const STORAGE_KEY = 'halal_shipping_profiles'

function generateId(): string {
  // crypto.randomUUID requires a secure context (HTTPS); use a safe fallback
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function loadProfiles(): ShippingProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProfiles(profiles: ShippingProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function useShippingProfiles() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>(loadProfiles)

  const addProfile = useCallback((profile: Omit<ShippingProfile, 'id'>) => {
    const newProfile: ShippingProfile = { ...profile, id: generateId() }
    setProfiles((prev) => {
      const next = [newProfile, ...prev]
      saveProfiles(next)
      return next
    })
  }, [])

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveProfiles(next)
      return next
    })
  }, [])

  return { profiles, addProfile, deleteProfile }
}
