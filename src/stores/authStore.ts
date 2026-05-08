import { create } from 'zustand'
import axios from 'axios'
import type { AuthState, Partner, Tier } from '../types'
import { API_BASE_URL } from '../lib/constants'
import { tokenHolder } from '../lib/tokenHolder'

const API_KEY = import.meta.env.VITE_PARTNER_API_KEY as string

/** Decode JWT payload without verification (client-side display only) */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

function parsePartner(payload: Record<string, unknown>): Partner | null {
  if (!payload) return null
  return {
    id:           String(payload.sub ?? payload.id ?? ''),
    name:         String(payload.name ?? payload.partner_name ?? 'Partner'),
    tier:         (payload.tier as Tier) ?? 'Bronze',
    discount_pct: Number(payload.discount_pct ?? payload.discount ?? 0),
  }
}

async function fetchToken(): Promise<{ token: string; partner: Partner | null }> {
  const res = await axios.post<{ success: boolean; data: { token: string; expires_in: string } }>(
    `${API_BASE_URL}/v1/auth/token`,
    { api_key: API_KEY },
    { headers: { 'Content-Type': 'application/json' } },
  )
  const token = res.data.data.token
  const payload = decodeJwtPayload(token)
  const partner = parsePartner(payload)
  return { token, partner }
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire refresh function into tokenHolder so api.ts can call it
  tokenHolder.setRefreshFn(async () => {
    await get().refresh()
  })

  return {
    token: null,
    partner: null,
    isReady: false,
    error: null,

    initialize: async () => {
      try {
        const { token, partner } = await fetchToken()
        tokenHolder.setToken(token)
        set({ token, partner, isReady: true, error: null })
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : String(err)
        set({ isReady: true, error: message })
      }
    },

    refresh: async () => {
      const { token, partner } = await fetchToken()
      tokenHolder.setToken(token)
      set({ token, partner, error: null })
    },
  }
})
