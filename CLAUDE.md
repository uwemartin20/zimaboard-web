# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`zimaboard-web` is the React + TypeScript frontend for **ZimaBoard** — an internal messaging / ticketing tool (Zimmermann). The UI is in German ("Nachrichten", "Abteilungen", "Mitteilungen", etc.) and is a SPA built with Vite, served as static assets. The backend is a separate Laravel API (not in this repo) and realtime updates are pushed via Laravel Echo / Pusher.

## Common Commands

All commands run from the project root (`C:\hamza-space\apps\ZiMaBoard\zimaboard-web`).

- `npm run dev` — start Vite dev server (HMR, default port 5173).
- `npm run build` — type-check with `tsc -b`, then produce a production build via `vite build` into `dist/`.
- `npm run preview` — serve the built `dist/` locally.
- `npm run lint` — run ESLint over the project using `eslint.config.js` (TypeScript + React Hooks + React Refresh rules).

There is no test runner configured in `package.json` (no `test`/`vitest`/`jest` script). All validation is type-checking (`tsc -b`) + ESLint.

## Environment Variables

Two env files are used by Vite (`import.meta.env.*`):

- `.env.local` — local dev. Points `VITE_API_BASE_URL` to `http://localhost:8080/api` and uses a local Pusher key.
- `.env.production` — production. Points `VITE_API_BASE_URL` to `https://zimaboard-api.zmwl.local/api` and sets `VITE_APP_ENV=prod`.

Variables consumed in code:
- `VITE_API_BASE_URL` — base URL for the Axios client and Echo auth endpoint.
- `VITE_PUSHER_APP_KEY` — Pusher key for Laravel Echo.
- `VITE_APP_ENV` — used as a channel-name prefix in Echo (e.g. `${VITE_APP_ENV}.user.<id>`).

When adding a new env var, declare it in both env files and reference it via `import.meta.env.VITE_*`.

## High-Level Architecture

### Entry & Providers (`src/main.tsx`, `src/App.tsx`)
`main.tsx` mounts `<App />` inside `<StrictMode>`. `App.tsx` wraps the app in three layers, in this order:

1. `BrowserRouter` (react-router-dom v7)
2. `ApiFeedbackProvider` — toast/loading banner bridge
3. `NotificationProvider` — notifications + Echo listener registration

### Routing (`src/routes/AppRoutes.tsx`)
All authenticated routes share a `<Layout />` parent with nested `<Outlet />` children. `PrivateRoute` is a simple `isLoggedIn()` check that redirects to `/login`. Notable routes: `Dashboard`, `assigned`, `created`, `announcement`, `new-message`, `messages/:id`, and `settings/{users,departments,statuses}`. The `Login` page is the only public route.

### API Layer (`src/api/`)
- `client.ts` — pre-configured `axios` instance. Interceptors attach the bearer token from `localStorage` and route every request/response through `notificationBus` (fires a loading toast on request, success/error toast on response based on `response.data.message` or `error.response.data.message`).
- `auth.ts` — `login()`, `logout(navigate?)`, `getUser()`, `isLoggedIn()`. All session state lives in `localStorage` (`token`, `user` keys).
- `echo.ts` — singleton `laravel-echo` instance using Pusher. The auth endpoint is `${VITE_API_BASE_URL}/broadcasting/auth` with the bearer token.
- `notificationBus.ts` — tiny pub-sub that lets the Axios interceptor (which has no React access) call into `ApiFeedbackProvider`'s UI handlers.

### Contexts (`src/context/`)
- `ApiFeedbackContext` — renders a single fixed-position toast (success / error / loading) driven by `notificationBus`. Auto-clears after 5s.
- `NotificationContext` — owns the notifications array, hydrates from `localStorage` and `/notifications` on mount, persists back to `localStorage` on change. Exposes `addNotification`, `markAsRead`, `markAllAsRead`, `removeNotification`. Note: the `id` field is actually the backend's `recipient_id`, not a notification id.
- `UnreadContext` — minimal unread counter, currently unused by `Layout` (import is commented out).

### Layout & Real-time (`src/components/Layout.tsx`)
`Layout` is the parent of all authenticated routes. On mount it parses the user from `localStorage`, joins the private Pusher channel `${VITE_APP_ENV}.user.<user.id>`, and listens for `.notification.created`, `.chat.created`, and `.message.created` events. `Layout` also resolves the page title from `location.pathname` via a hardcoded `titleMap` (add a new entry here when introducing a new route). It renders the global `<ToastContainer />` for `react-toastify`.

### Pages & Components
- Pages in `src/pages/` map 1:1 to routes. `NewMessage` and `MessageDetail` are the heaviest.
- Reusable components in `src/components/`: `Navbar`, `Sidebar`, `Layout`, `Board`, `MessageModal`, `NewMessage` (modal variant), `ShareModal`, `SummaryCard`, `UserCircle`, `Avatar`, `ChangePasswordModal`.
- Settings UIs live in `src/components/settings/` (shared `SettingsFormModal`, `SettingsTable`, `UserFormModal`) and are consumed by the pages under `src/pages/settings/`.

### Utilities
- `src/utils/timeAgo.ts` — single `timeAgo(dateString)` helper that returns German-relative strings ("vor 3 minuten", "vor 2 std.", etc.).

## Conventions & Gotchas

- **Auth state is in `localStorage`, not React state.** `auth.ts` reads/writes directly; `PrivateRoute` re-checks on every render. Logging out is `logout(navigate)` from `auth.ts`.
- **Echo channel name is environment-prefixed.** Channel is `${VITE_APP_ENV}.user.<id>`, and the backend event names are dot-prefixed (`.notification.created`, etc.). Keep these in sync with the Laravel side.
- **`ApiFeedbackProvider` must wrap `NotificationProvider`.** The axios interceptor → `notificationBus` → `ApiFeedbackProvider` flow assumes the provider is mounted so a `register(...)` has been called.
- **Two notification surfaces coexist.** `NotificationContext` (top-right bell in `Navbar`) and `react-toastify`'s `ToastContainer` (bottom-right toasts). New realtime events typically call `addNotification` and rely on its built-in `toast.info(...)`.
- **German UI strings.** Form labels, error messages from the API, and the `titleMap` in `Layout` are German. The default axios error message is `"Etwas ist schiefgelaufen."` (German for "Something went wrong."). Add new strings in German unless told otherwise.
- **No tests.** When you add logic that warrants coverage, propose a test setup (Vitest is the natural fit) rather than inventing one.
- **Vite + Tailwind v3 setup.** Tailwind is configured via `tailwind.config.js` with `content` globs over `src/**/*.{js,ts,jsx,tsx}` and the three `@tailwind` directives in `src/index.css`. PostCSS runs through `postcss.config.js`. (Note: `@tailwindcss/vite` is also installed but Tailwind is currently loaded through PostCSS.)
- **Path alias:** none configured. Imports use relative paths (`../api/client`, `./context/...`).
