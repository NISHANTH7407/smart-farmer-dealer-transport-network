# AgriConnect Supply Chain Management System

A **production-grade, scalable, secure, and maintainable** React application designed specifically for Agriculture Supply Chain Management, supporting various roles (Admin, Farmer, Dealer) with multilingual support.

## 🚀 Built With

* **React 18** + **Vite**
* **React Router v6** (Protected & Role-based routes)
* **TanStack React Query** (Server state, caching, synchronization)
* **React Hook Form + Zod** (Performant, validated form handling)
* **Axios** (Centralized API client with Interceptors)
* **i18next** (Multilingual: English & Tamil)
* **Vanilla CSS / CSS Variables** (Advanced theming, mobile-first responsiveness, zero unneeded bloat)

## 📁 Project Architecture (Feature-Based)

```
src/
├── api/             # Setup Axios and Interceptors
├── app/             # Application entry and QueryClient Setup
├── components/      # Reusable generic UI elements (Buttons, Cards, Inputs, Tables)
├── features/        # Feature modules encapsulating Views, APIs, and States (e.g. auth, dashboard, farmers)
├── hooks/           # Reusable React Hooks
├── i18n/            # Internationalization config and locales
├── layouts/         # High-level UI layouts (DashboardLayout containing Sidebar & Headbar)
├── routes/          # Declarative AppRoutes, Lazy loading, Protected Route configurations
└── utils/           # Utility functions (Local Storage Auth parsing)
```

## 🔐 Authentication & Security

1. **Tokens:** JWT Bearer tokens securely stored in LocalStorage.
2. **Role-Based Access (RBAC):** UI renders distinct Sidebars and limits routes using role checks (`ADMIN`, `FARMER`, `DEALER`).
3. **Protected Routes:** `ProtectedRoute.jsx` wraps entire modules, auto-redirecting unauthenticated users to `/login`.

## 🌐 Error Handling & Request Management

* Configured with **Axios Interceptors**.
* Automatically appends `Bearer Tokens`.
* Intelligent retry mechanisms for `5xx` internal server errors (Exponential backoff max `2` retries).
* Global error handling invalidating authentication precisely on `401`.

## 🧠 State Management (Strict Rules Applied)

* Fully migrated to `React-Query`.
* Strict invalidations hooked inside `useMutation` triggers.
* Standardized 5-minute cache `staleTime`.
* **Complete fallback capability:** Features switch automatically to mock objects when the production backend is unreachable.

## 🎨 Design System

Premium agricultural UI centered around dark greens (`#15803d`) and tailored custom variables enabling instant **Light/Dark Mode**. Highly interactive, performant components structured natively avoiding heavy styling libraries ensuring the highest rendering speeds and layout predictability.

---

## 💻 Getting Started

### 1. Requirements
* Node.js v18+

### 2. Run Locally

```bash
# Provide environment variables (backend URL)
cp .env.example .env

# Install dependencies (if not already installed)
npm install

# Start local server
npm run dev
```

### 3. Testing Login (Mock Fallback)
If the backend Server is offline, the authentication and module APIs will automatically fallback generating mocked payloads. To simulate different roles:
- `admin@agri.com` (password: any > 4 chars)
- `farmer@agri.com`
- `dealer@agri.com`
