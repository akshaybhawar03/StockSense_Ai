# StockSense AI — Frontend (SmartGodown)

Claude Code ke liye project context. Ye file project ki architecture, patterns, aur rules define karti hai.

---

## Project Overview

**Product name (UI):** SmartGodown  
**Repo name:** StockSense AI — Frontend  
**Type:** AI-powered inventory management SaaS  
**Stack:** React 18 + Vite 6 + TypeScript 5 + Tailwind CSS v4  
**Backend:** Separate Python FastAPI repo hosted on Render  
**Backend base URL:** `https://stocksense-backend-wijr.onrender.com/api/v1`  
**Env var to override:** `VITE_API_URL`

---

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # Production build
```

No test runner is configured. No lint script in package.json.  
TypeScript check: `npx tsc --noEmit`

---

## Folder Structure

```
src/app/
├── App.tsx                  # Root — provider tree
├── routes.tsx               # All routes (React Router v7)
├── Layout.tsx               # Public pages shell (Navbar + Footer)
│
├── pages/                   # Top-level page components
│   ├── Dashboard.tsx        # Main KPI dashboard (protected)
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Home.tsx / About.tsx / Features.tsx / Pricing.tsx / etc.
│   └── SmartInventory.tsx / SmartDashboard.tsx
│
├── components/
│   ├── dashboard/           # All dashboard sub-pages and widgets
│   │   ├── DashboardLayout.tsx      # Shell: sidebar, header, nav prefetch
│   │   ├── InventoryManager.tsx     # Paginated inventory table
│   │   ├── AIForecastEngine.tsx     # Weekly demand forecast
│   │   ├── AlertsPage.tsx           # Stock alerts grouped by severity
│   │   ├── AnalyticsPage.tsx        # Charts and analytics
│   │   ├── AiReportPage.tsx         # AI-generated report
│   │   ├── CsvUploadModal.tsx       # CSV/Excel upload
│   │   ├── DeadStockAnalyzer.tsx
│   │   ├── CashFlowOptimizer.tsx
│   │   ├── ReorderPredictor.tsx
│   │   ├── GlobalCharts.tsx
│   │   ├── PowerBIDashboard.tsx
│   │   ├── NotificationBell.tsx
│   │   └── DashboardSettings.tsx / DashboardIntegrations.tsx
│   ├── inventory/           # Shared inventory modals
│   │   ├── EditItemModal.tsx
│   │   ├── RecordSaleModal.tsx
│   │   └── ProductTable.tsx
│   ├── ai/
│   │   └── ChatPanel.tsx    # Floating AI chat widget (global)
│   ├── skeletons/           # Loading skeleton components
│   ├── ui/                  # shadcn/ui-style primitives (Radix-based)
│   └── StockAIChat.tsx      # Full-page AI chat
│
├── contexts/
│   ├── AuthContext.tsx      # JWT auth + user state
│   ├── DataContext.tsx      # Dexie local DB (inventory, sales, forecasts, KPIs)
│   ├── ThemeContext.tsx      # light/dark + accent color
│   └── LanguageContext.tsx
│
├── services/                # All API calls (axios)
│   ├── api.ts               # Axios instance + interceptors
│   ├── dashboard.ts         # /dashboard, /dashboard/health, /dashboard/dead-stock-analysis
│   ├── inventory.ts         # /inventory CRUD + CSV upload
│   ├── forecast.ts          # /forecast
│   ├── analytics.ts         # /analytics
│   ├── ai.ts                # /ai/*, /alerts, SSE stream
│   ├── notificationService.ts
│   └── ragService.ts
│
└── lib/
    ├── queryClient.ts       # TanStack Query client config
    └── db.ts                # Dexie IndexedDB schema (local cache)
```

---

## Provider Tree (App.tsx)

```
ThemeProvider
  └── LanguageProvider
        └── AuthProvider
              └── QueryClientProvider
                    └── RouterProvider
                          └── (protected) DataProvider   ← only inside /dashboard/*
```

`DataProvider` wraps only the dashboard subtree — not the whole app.

---

## Routing

### Public routes (`/`)
| Path | Component |
|------|-----------|
| `/` | Home |
| `/about` | About |
| `/features` | Features |
| `/pricing` | Pricing |
| `/how-it-works` | HowItWorks |
| `/contact` | Contact |
| `/demo` | Demo |
| `/login` | Login |
| `/register` | Register |

### Protected dashboard routes (`/dashboard/*`)
Wrapped in `<ProtectedRoute>` + `<DataProvider>` + `<DashboardLayout>`.

| Path | Component |
|------|-----------|
| `/dashboard` | Dashboard (KPI overview) |
| `/dashboard/inventory` | InventoryManager |
| `/dashboard/forecast` | AIForecastEngine |
| `/dashboard/ai-assistant` | StockAIChat |
| `/dashboard/alerts` | AlertsPage |
| `/dashboard/integrations` | DashboardIntegrations |
| `/dashboard/settings` | DashboardSettings |
| `/dashboard/ai-report` | AiReportPage |
| `/dashboard/analytics` | AnalyticsPage |

---

## API Endpoints

All calls go through `src/app/services/api.ts` (Axios instance).  
Bearer token is attached automatically via request interceptor from `localStorage.getItem('access_token')`.  
401 responses trigger localStorage clear + redirect to `/login`.

| Method | Path | Service file |
|--------|------|-------------|
| POST | `/auth/login` | AuthContext |
| POST | `/auth/register` | AuthContext |
| GET | `/dashboard` | dashboard.ts |
| GET | `/dashboard/health` | dashboard.ts |
| GET | `/dashboard/dead-stock-analysis` | dashboard.ts |
| GET | `/inventory` | inventory.ts (paginated + filterable) |
| GET | `/inventory/categories` | inventory.ts |
| POST | `/inventory/batch` | inventory.ts (CSV upload) |
| PUT | `/inventory/:id` | inventory.ts |
| DELETE | `/inventory/:id` | inventory.ts |
| POST | `/stock/record-sale` | inventory.ts |
| GET | `/forecast` | forecast.ts |
| GET | `/analytics` | analytics.ts |
| GET | `/alerts` | ai.ts |
| GET | `/ai/analyse` | ai.ts |
| GET | `/ai/analyse/stream` | ai.ts (SSE — token in query param) |
| GET | `/ai/insights/low-stock` | ai.ts |
| GET | `/ai/insights/dead-stock` | ai.ts |
| POST | `/ai/chat` | ai.ts |

---

## State Management

### TanStack Query (server state)
Used for all backend API calls. Query key conventions:

```ts
['dashboard', 'stats']
['dashboard', 'health']
['dashboard', 'deadStock']
['inventory', 'list', { search, category, status, page, sortField, sortOrder }]
['inventory', 'categories']
['forecast', 'weekly']
['analytics', 'overview']
['alerts', 'active']
```

**queryClient config** (`src/app/lib/queryClient.ts`):
- `staleTime: 60_000` (1 min)
- `gcTime: 60_000` (1 min — important: paginated inventory creates many unique keys, keep low)
- `retry: 1`
- `refetchOnWindowFocus: false`

**Prefetch on nav hover:** `DashboardLayout.tsx` prefetches each page's queries when user hovers its nav link. Add new pages to the `prefetchMap` there.

**Cache invalidation after CSV upload:** Components listen for the `'csv-uploaded'` custom DOM event. Fire it after upload: `window.dispatchEvent(new Event('csv-uploaded'))`.

### React Context (client state)
- **AuthContext** — `isLoggedIn`, `user`, `login()`, `register()`, `logout()`, `isLoading`. Context value is memoized with `useMemo([user, isLoading])`.
- **DataContext** — Dexie local DB mirror: `inventory`, `sales`, `forecasts`, `datasets`, `kpis`, `refreshData()`, `isLoadingData`. Context value is memoized. Only available inside `/dashboard/*`.
- **ThemeContext** — `mode` (light/dark), `accentColor` (blue/green/purple/orange), `toggleMode()`.

---

## Data Flow

```
CSV Upload
    → POST /inventory/batch
    → fire 'csv-uploaded' DOM event
    → React Query invalidates ['dashboard'], ['inventory']
    → Components re-fetch and re-render

Dashboard load
    → 3 parallel queries: stats, health, deadStock
    → DataContext also reads from Dexie (local fallback KPIs)
    → Stats shown: stats API first, kpis (Dexie) as fallback
```

---

## Key Patterns

### Dead stock resolution
`resolveDeadStock()` helper in `src/app/pages/Dashboard.tsx` — backend returns this field under different names depending on version. Always use this helper, never write the `as any` chain directly.

```ts
resolveDeadStock(stats, deadStockData, kpis?.deadStock ?? 0)
```

### API response normalization (inventory list)
Backend may return items under `data.items`, `data.data`, or `data.products`. Always normalize:
```ts
const itemsList = data.items || data.data || data.products || [];
const totalCount = data.total || data.count || itemsList.length;
```

### Sorting + pagination (InventoryManager)
Page state resets to 1 on any filter change. Sort and filter changes are debounced (300ms on search). All filter state is part of the React Query key so each unique filter combo is independently cached.

---

## Dexie (IndexedDB) Schema

Used by `DataContext` as a local cache / offline layer. Not the primary data store for the dashboard (backend is).

```
StockSenseDB v2:
  users:     id, &email
  inventory: id, userId, sku, [userId+sku], category
  sales:     id, userId, sku, [userId+sku], date
  forecasts: id, userId, sku, [userId+sku], date
  datasets:  id, userId, name, createdAt
```

---

## UI / Styling

- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Radix UI** primitives (all in `src/app/components/ui/`)
- **Lucide React** for icons
- **Recharts** for all charts
- **Framer Motion / motion** for page/card animations
- **Accent color:** CSS variables `--accent-primary` and `--accent-secondary` (RGB values). Default green: `75 226 119`.
- **Dark mode:** Toggled via `.dark` class on `<html>`. Use `dark:` Tailwind variants.

---

## Auth

- JWT stored in `localStorage` under key `access_token`
- User email stored under `localStorage.userEmail`, name under `localStorage.userName`
- Token auto-attached by Axios request interceptor
- On 401: localStorage cleared, hard redirect to `/login`
- **Known security risk:** localStorage is XSS-accessible. Plan: migrate to httpOnly cookies.

---

## Known Issues (Do Not Regress)

| # | Issue | Status |
|---|-------|--------|
| 1 | Auth token in localStorage — XSS risk | Open |
| 2 | ~100+ `any` type casts — no schema validation | Open |
| 3 | No React Error Boundaries anywhere | Open |
| 4 | No tests | Open |
| 5 | `ai.ts` SSE stream passes token in URL query param | Open |

---

## Recently Fixed

| File | Fix |
|------|-----|
| `DataContext.tsx` | Added `useMemo` on context value — prevents cascading re-renders |
| `AuthContext.tsx` | Added `useMemo` on context value |
| `queryClient.ts` | `gcTime` reduced from 300s → 60s — prevents paginated cache memory bloat |
| `AlertsPage.tsx` | Fixed corrupted UTF-8 replacement character in SKU/category separator |
| `Dashboard.tsx` | Replaced 7-level `as any` dead stock chain with typed `resolveDeadStock()` helper |

---

## Dependencies (Key)

| Package | Purpose |
|---------|---------|
| `react-router` v7 | Routing |
| `@tanstack/react-query` v5 | Server state / caching |
| `axios` | HTTP client |
| `dexie` v4 | IndexedDB (local cache) |
| `recharts` | Charts |
| `framer-motion` / `motion` | Animations |
| `react-hook-form` + `zod` | Form validation |
| `react-hot-toast` | Toasts |
| `papaparse` | CSV parsing |
| `xlsx` | Excel parsing |
| `use-debounce` | Search input debounce |
| `lucide-react` | Icons |
| `tailwind-merge` + `clsx` | Class merging |
| `@emailjs/browser` | Contact form emails |
