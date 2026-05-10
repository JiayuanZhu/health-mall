# CLAUDE.md

This file provides guidance to Claude Code (or any AI coding assistant) when working on this project.

## Project Overview

Health Mall (健康医疗商城) is a full-stack online healthcare platform with medicine purchasing, department browsing, and doctor appointment booking. It uses a monorepo structure with separate client and server directories.

## Architecture

- **Frontend**: Vite + React 18 + Tailwind CSS (in `client/`)
- **Backend**: Express.js + SQLite via better-sqlite3 (in `server/`)
- **Auth**: JWT tokens with bcryptjs password hashing
- **Dev proxy**: Vite proxies `/api` requests to `http://localhost:3001`

## Common Commands

```bash
# Start both frontend and backend in dev mode
npm run dev

# Start only the backend
npm run dev:server

# Start only the frontend
npm run dev:client

# Build frontend for production
cd client && npm run build

# Install all dependencies (run from root)
npm install && cd client && npm install && cd ../server && npm install && cd ..
```

## Code Structure

### Frontend (`client/src/`)
- `App.jsx` — Route definitions (React Router v6)
- `components/Layout.jsx` — User-facing layout with navbar and footer
- `components/AdminLayout.jsx` — Admin dashboard layout with sidebar
- `contexts/AuthContext.jsx` — Authentication state (JWT token, user info)
- `contexts/CartContext.jsx` — Shopping cart state
- `pages/` — Page components (Home, Products, Cart, Login, etc.)
- `pages/admin/` — Admin pages (Dashboard, Products, Orders, Users, Appointments)
- `utils/api.js` — Axios instance configured with auth token interceptor

### Backend (`server/`)
- `index.js` — Express app entry point, port 3001
- `db.js` — SQLite database initialization, schema creation, and seed data
- `middleware/auth.js` — JWT authentication middleware
- `routes/` — Express route handlers for each API module

### Database
- SQLite file at `server/health-mall.db` (auto-created on first run)
- Tables: `users`, `categories`, `products`, `departments`, `doctors`, `cart`, `orders`, `order_items`, `appointments`, `banners`
- WAL mode enabled, foreign keys enforced

## Key Patterns

- **Authentication**: JWT stored in localStorage, sent via `Authorization: Bearer <token>` header. The `api.js` Axios interceptor attaches it automatically.
- **Admin routes**: Protected by checking `user.role === 'admin'` in middleware.
- **State management**: React Context for auth and cart — no Redux.
- **Styling**: Tailwind CSS utility classes; config in `client/tailwind.config.js`. Custom color theme uses sky/emerald palette.
- **API proxy**: In development, Vite config proxies all `/api/*` to the Express backend so no CORS issues.

## Default Credentials

- Admin: `admin` / `admin123`
- User: `user1` / `123456`

## Guidelines

- All UI text is in Chinese (zh-CN).
- Keep the SQLite database file and its WAL/SHM files out of git (see `.gitignore`).
- Frontend uses JSX (not TypeScript). Type annotations from `@types/react` are devDependencies for editor support only.
- When adding new API routes, register them in `server/index.js` and create the route file in `server/routes/`.
- When adding new pages, add the route in `client/src/App.jsx` and create the component in `client/src/pages/`.
