// Shared token holder — avoids circular dependency between api.ts and authStore.ts
let _token: string | null = null
let _refreshFn: (() => Promise<void>) | null = null

export const tokenHolder = {
  getToken: () => _token,
  setToken: (t: string | null) => { _token = t },
  setRefreshFn: (fn: () => Promise<void>) => { _refreshFn = fn },
  refresh: () => _refreshFn?.() ?? Promise.resolve(),
}
