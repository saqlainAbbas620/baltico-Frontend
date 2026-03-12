# BaltiCo — Frontend

> High-fashion e-commerce storefront built with React 18 + Vite. Palm Angels-inspired aesthetic with a full shopping experience, Google OAuth, and a complete admin panel.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Play_CDN-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

---

## Features

### Storefront
- **Hero banner** — full-bleed image managed from admin CMS
- **Category pages** — Women, Men, Kids, Sale with price sort
- **Product pages** — stacked gallery, sticky info panel, size selector, live stock badge
- **All Products** — global search, category + stock filters, sort by newest / price
- **New In** — horizontal scroll row; badge auto-expires after 30 days
- **Cart** — persistent across sessions via `localStorage`
- **Checkout** — delivery form, Cash on Delivery, order confirmation screen

### Auth
- Email / password register + login
- **Email verification** — link sent on register, auto-login after click
- **Google OAuth** — lazy-loaded GIS hook, fully responsive custom button (no iframe)
- Session persisted to `localStorage`, restored on reload
- **Auto-refresh** access token via Axios interceptor — queues concurrent requests during refresh
- Session-expired event broadcasts to UI → redirects to `/auth`

### Admin Panel (`/admin`)
| Tab | Purpose |
|---|---|
| **Dashboard** | Revenue KPIs, orders bar chart, status breakdown, stock alerts |
| **Products** | Full CRUD with dual image picker (URL paste or Cloudinary drag-and-drop upload) |
| **CMS** | Hero banner + 3 category tile images with live preview |
| **Orders** | Sortable table, inline status dropdown, order detail modal, real-time new-order badge |

### UX
- Fully mobile responsive — collapsible filters, 85 vw slide-in drawer nav, sticky admin tab bar
- `react-hot-toast` notifications — stacked, animated, matches brand palette
- Hover image swap on product cards, discount / NEW / LOW / OUT badges
- Scroll-to-top on every route change

---

## Project Structure

```
baltico/
├── index.html                 ← Tailwind Play CDN + Google Fonts
├── vite.config.js
├── vercel.json                ← SPA rewrite rule for Vercel
└── src/
    ├── App.jsx                ← BrowserRouter + route guards + layout wrapper
    ├── main.jsx
    ├── api/
    │   ├── axiosInstance.js   ← Base axios + auto-refresh interceptor
    │   ├── authApi.js
    │   ├── productsApi.js
    │   ├── ordersApi.js
    │   ├── cmsApi.js
    │   └── index.js           ← Barrel export
    ├── context/
    │   └── store.jsx          ← Global state: user, cart, products, orders, CMS
    ├── hooks/
    │   └── useGoogleAuth.js   ← Lazy GIS script loader + One Tap initialisation
    ├── data/
    │   ├── seed.js            ← 12 fallback products + seed banner/category images
    │   └── utils.js           ← finalPrice, fmt, isNew, stockInfo, statusStyle
    ├── components/
    │   ├── layout/            ← Navbar · Footer · MobileMenu
    │   ├── product/           ← ProductCard · ProductGrid
    │   ├── cart/              ← CartItem
    │   └── ui/                ← Toast (Toaster config) · ImagePicker
    └── pages/
        ├── HomePage.jsx
        ├── CategoryPage.jsx
        ├── ProductPage.jsx
        ├── AllProductsPage.jsx
        ├── CartPage.jsx
        ├── CheckoutPage.jsx
        ├── AuthPage.jsx
        ├── ProfilePage.jsx
        ├── AboutPage.jsx
        └── admin/
            ├── AdminPage.jsx  ← Protected layout + sidebar / mobile tab nav
            ├── Dashboard.jsx
            ├── Products.jsx
            ├── BannerCMS.jsx
            └── Orders.jsx
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:5000` (see [backend README](../backend/README.md))

### Install & Run

```bash
npm install
cp .env.example .env   # fill in VITE_API_URL
npm run dev            # → http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend base URL — e.g. `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | No | Enables Google OAuth button |

```bash
npm run dev       # Development — hot reload on port 3000
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

---

## Route Guards

| Route | Guard | Fallback |
|---|---|---|
| `/checkout` | `RequireAuth` | Redirect to `/auth` |
| `/profile` | `RequireAuth` | Redirect to `/auth` |
| `/admin` | `RequireAdmin` | Redirect to `/auth` or `/` |

**Demo admin:** `admin@baltico.com` — any password in offline/demo mode.

---

## State Management

React Context + `useState`. No external state library.

| Slice | Persisted | Populated by |
|---|---|---|
| `user` | `localStorage` | API on login, rehydrated on mount |
| `cart` | `localStorage` | Local mutations, rehydrated on mount |
| `products` | — | API on mount, falls back to `SEED_PRODUCTS` |
| `orders` | — | API after login |
| `banner` | — | CMS API on mount |
| `categoryImages` | — | CMS API on mount |

---

## Design System

Tailwind custom tokens (defined in `index.html`):

| Token | Hex | Usage |
|---|---|---|
| `brand` | `#4484CE` | Accents, NEW badge, links |
| `ink` | `#0a0a0a` | Primary text, CTA buttons |
| `cream` | `#f5f5f3` | Page background, hover fills |
| `sand` | `#D9D9D9` | Borders, muted text, dividers |
| `gold` | `#F9CF00` | Admin active state, admin brand |
| `amber` | `#F19F4D` | Low stock warnings, error toasts |

**Fonts:** UnifrakturMaguntia (display/logo) · Cormorant Garamond (editorial serif) · Montserrat (body UI)

---

## Deployment — Vercel

1. Push this folder to a GitHub repository
2. Import to Vercel → Framework: **Vite** (auto-detected)
3. Set environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your production Google client ID |

4. Deploy — Vercel runs `npm run build` and serves `dist/`

`vercel.json` rewrites all paths to `/index.html` so React Router works correctly on direct URL access and page refresh.

---

## Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v6 | Client-side routing with `useNavigate` / `useParams` |
| `axios` | HTTP client with request/response interceptors |
| `react-hot-toast` | Toast notification system |
| `react-icons` | Icon components (HeroIcons, Ionicons, Material) |
| `vite` + `@vitejs/plugin-react` | Build tooling + Fast Refresh |
