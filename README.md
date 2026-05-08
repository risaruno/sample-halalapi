# HalalAPI Partner Demo

A professional React + Vite partner storefront demonstrating real integration with the [HalalAPI](https://halalapi-api.vercel.app) gateway — a controlled API layer in front of Cafe24's halal marketplace.

---

## What This Demo Shows

| Page | URL | Description |
|------|-----|-------------|
| Products | `/products` | Browse all products with your tier-discounted price. Auto-refreshes every 5 minutes. |
| Checkout | `/checkout` | Review cart, enter Korean address via Kakao Postcode, place an order. |
| Orders | `/orders` | Full order history for your partner account. |
| Order Detail | `/orders/:id` | Line items, totals, shipping address, and status actions. |

---

## Setup

### 1. Prerequisites

- Node.js 18+
- An active HalalAPI partner API key (see below)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=https://halalapi-api.vercel.app
VITE_PARTNER_API_KEY=hm_live_xxxx_xxxxxxxx   # your API key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app authenticates automatically — no login screen.

---

## How to Get a Partner API Key

1. Contact the HalalAPI administrator or visit the [partner portal](https://halalapi-web.vercel.app).
2. Your key starts with `hm_live_` (production) or `hm_test_` (sandbox).
3. Your key encodes your **tier** (Bronze / Silver / Gold) and **discount percentage**.

---

## Authentication Flow

The app uses a **two-step, zero-UI auth flow**:

```
App starts
  → POST /v1/auth/token  { api_key: VITE_PARTNER_API_KEY }
  ← { token, expires_in: "1h" }
  → Store JWT in Zustand (memory only)
  → Attach to all Axios requests as: Authorization: Bearer <token>
  → On 401: silently re-call /v1/auth/token and retry once
```

**The API key never appears in any network request after the initial token exchange.**  
The JWT is stored in memory (Zustand) only — it is never written to localStorage or cookies.

The cart is persisted in **sessionStorage** (survives page refresh, cleared on tab close).

---

## Address Search

The checkout form uses [Kakao Postcode API](https://postcode.map.kakao.com/guide) for Korean address lookup:

- Click **"주소 찾기"** to open the Kakao popup.
- Select your address — postal code, street address, and city auto-fill.
- Enter the detail address (apartment / floor / unit) manually.

No API key is required for Kakao Postcode.

---

## Pricing

All prices are in **KRW (Korean Won)**. Formatted as `₩4,000` — no decimal places.

| Field | Meaning |
|-------|---------|
| `selling_price` | Original consumer price (shown crossed out) |
| `your_price` | Your tier-discounted price (prominent display) |
| Delivery fee | Fixed **₩4,000** — always, for every order |

The delivery fee is displayed in the UI only. It is **not sent to `POST /v1/orders`** — the API calculates order totals from product prices only.

---

## Partner Tiers

| Tier | Discount |
|------|----------|
| 🥇 Gold | 15% |
| 🥈 Silver | 10% |
| 🥉 Bronze | 5% |

Your tier and discount percentage are shown in the top bar.

---

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/auth/token` | Exchange API key for JWT |
| `GET` | `/v1/products` | Product catalog with tier pricing |
| `GET` | `/v1/products/categories` | Category list (falls back to client-side if unavailable) |
| `POST` | `/v1/orders` | Place a new order |
| `GET` | `/v1/orders` | List your orders |
| `GET` | `/v1/orders/:id` | Single order detail |
| `PATCH` | `/v1/orders/:id/cancel` | Cancel a pending order |

---

## Order Actions (Partner)

Partners can only **cancel** a pending order (`PATCH /v1/partner/orders/:id/cancel`).

Payment confirmation is an admin-side operation. If you need a partner-facing confirmation flow, HalalAPI should expose a dedicated endpoint such as `PATCH /v1/partner/orders/:id/confirm`.

---

## Project Structure

```
src/
├── lib/
│   ├── api.ts           Axios instance, JWT interceptor, silent 401 refresh
│   ├── constants.ts     DELIVERY_FEE, formatKRW(), ROUTES
│   └── tokenHolder.ts   Shared token store (avoids circular imports)
├── stores/
│   ├── authStore.ts     Zustand: token, partner info, initialize/refresh
│   └── cartStore.ts     Zustand: cart items, sessionStorage persistence
├── hooks/
│   ├── useProducts.ts   Products fetch + 5-min auto-refresh
│   ├── useCategories.ts Category list (API or client-side fallback)
│   └── useOrders.ts     Orders list fetch
├── components/
│   ├── layout/          AppShell, Sidebar, TopBar
│   ├── ui/              Badge, Button, Card, EmptyState, LoadingSpinner, PriceTag
│   ├── products/        ProductGrid, ProductCard, CategoryFilter
│   ├── cart/            CartDrawer, CartItem, CartSummary
│   └── orders/          OrderCard, OrderList, OrderStatusBadge
├── pages/
│   ├── ProductsPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   └── OrderDetailPage.tsx
└── types/index.ts       All TypeScript interfaces + Kakao Postcode global type
```

---

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **React Router DOM v6** — client-side routing
- **Zustand** — auth and cart state management
- **Axios** — HTTP client with JWT interceptor
- **Tailwind CSS** — utility-first styling
- **react-hot-toast** — notifications
- **lucide-react** — icons
- **date-fns** — date formatting
- **Kakao Postcode API** — Korean address search (no API key needed)
