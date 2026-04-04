# Finance Data Processing — Frontend

React (JavaScript) single-page application for the Finance Dashboard. Communicates with the FastAPI backend via REST API with JWT authentication.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (JavaScript / JSX) |
| Routing | React Router v6 |
| HTTP Client | Axios (with JWT interceptor) |
| Charts | Recharts |
| Styling | Tailwind CSS v3 |
| Build Tool | Vite 5 |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config (React plugin + API proxy)
├── tailwind.config.js          # Tailwind content paths
├── postcss.config.js           # PostCSS (Tailwind + Autoprefixer)
├── package.json
└── src/
    ├── main.jsx                # React root — mounts App into #root
    ├── App.jsx                 # Route definitions
    ├── index.css               # Tailwind directives + component classes
    ├── api/
    │   ├── client.js           # Axios instance: JWT header + 401 redirect
    │   └── finance.js          # All API call functions
    ├── context/
    │   └── AuthContext.jsx     # Auth state: user, login(), logout()
    ├── components/
    │   ├── Sidebar.jsx         # Navigation sidebar with role-aware links
    │   └── ProtectedRoute.jsx  # Route guard: redirect or show Access Denied
    └── pages/
        ├── LoginPage.jsx       # Login form with sample credentials hint
        ├── DashboardPage.jsx   # KPI cards, bar chart, pie chart, recent txns
        ├── TransactionsPage.jsx # Transactions table: CRUD, filters, pagination
        └── UsersPage.jsx       # User management table (admin only)
```

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Backend running on `http://localhost:8000` (see [backend README](../backend/README.md))

### Install & run

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Opens at **http://localhost:3000** (or next available port).

### Build for production

```bash
npm run build
# Output is in dist/
```

---

## Pages

### Login (`/login`)

- Simple username / password form
- On success, stores the JWT token in `localStorage` and redirects to the dashboard
- Shows sample credentials for quick testing

### Dashboard (`/`)

- **KPI cards** — Total Income, Total Expenses, Net Balance, Transaction Count
- **Bar chart** — Monthly income vs expense trend (Recharts)
- **Pie chart** — Expense breakdown by category (top 8)
- **Recent transactions** table — last 10 entries
- **Year filter** — "All Time" (default) or a specific year (2024 / 2025 / 2026)
- Accessible to all authenticated roles

### Transactions (`/transactions`)

- **Filterable table** — filter by type, category (partial match), date range
- **Pagination** — 15 records per page with previous/next controls
- **Create / Edit** — modal form for new or existing transactions (Analyst + Admin only)
- **Delete** — soft-delete with confirmation prompt (Admin only)
- Action buttons are hidden automatically based on the logged-in user's role

### User Management (`/users`)

- Admin-only page (redirect to Access Denied for other roles)
- **Create user** — modal form with email, username, password, full name, role
- **Edit user** — update full name, role, and active status
- **Delete user** — with confirmation prompt

---

## Authentication & Access Control

**Token storage:** `localStorage` key `token`

**Axios interceptor** (`src/api/client.js`):
- Automatically attaches `Authorization: Bearer <token>` to every request
- On `401` response: clears the token and redirects to `/login`

**ProtectedRoute** (`src/components/ProtectedRoute.jsx`):
- Redirects unauthenticated users to `/login`
- Accepts an optional `allowedRoles` prop — renders an Access Denied panel if the user's role is not included

**Role-aware UI:**
- "New" and edit buttons on the Transactions page are only rendered for `admin` and `analyst` roles
- The "Users" nav link and page are only visible to `admin`

---

## API Proxy

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no CORS issues occur during development:

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
},
```

---

## Tailwind Custom Classes

Reusable component classes are defined in `src/index.css`:

| Class | Description |
|-------|-------------|
| `.input` | Styled form input / select field |
| `.label` | Small uppercase form label |
| `.btn-primary` | Indigo filled button |
| `.btn-secondary` | Gray outlined button |

---

## Environment

No `.env` file is needed for local development — the Vite proxy handles the API routing. For production builds, configure the backend URL in a `.env` file or your hosting platform's environment variables.

---

## Sample Credentials

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | Admin | Full access including user management |
| `analyst` | `analyst123` | Analyst | Read + create/edit transactions |
| `viewer` | `viewer123` | Viewer | Read only |
