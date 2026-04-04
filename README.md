# Finance Data Processing

A full-stack finance dashboard application for tracking income and expenses, generating analytics, and managing users with role-based access control.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (JavaScript), Vite 5, Tailwind CSS, Recharts |
| Backend | FastAPI 0.129, SQLAlchemy 2.x, Pydantic v2 |
| Database | SQLite (local file — `backend/finance.db`) |
| Auth | JWT (PyJWT), PBKDF2-HMAC-SHA256 password hashing |
| Runtime | Python 3.14, Node.js 18+ |

---

## Project Structure

```
Finance Data Processing/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # FastAPI app entry, CORS, router registration
│   │   ├── database.py         # SQLAlchemy engine + session (SQLite)
│   │   ├── models.py           # ORM models: User, Transaction
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── auth.py             # JWT and password hashing (stdlib only)
│   │   ├── dependencies.py     # require_roles() RBAC dependency
│   │   └── routers/
│   │       ├── auth.py         # POST /api/auth/login, GET /api/auth/me
│   │       ├── users.py        # CRUD /api/users
│   │       ├── transactions.py # CRUD /api/transactions
│   │       └── dashboard.py    # GET /api/dashboard/summary
│   ├── seed_data.py            # Seeds 4 users + 120 transactions
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # DATABASE_URL, SECRET_KEY, JWT config
│   ├── finance.db              # SQLite database (auto-created on first run)
│   ├── .venv/                  # Python virtual environment
│   └── README.md               # Backend documentation
│
├── frontend/                   # React JavaScript frontend
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Router + protected route setup
│   │   ├── api/
│   │   │   ├── client.js       # Axios instance with JWT interceptor
│   │   │   └── finance.js      # API call functions
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   │   └── ProtectedRoute.jsx # Route guard with RBAC
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── TransactionsPage.jsx
│   │       └── UsersPage.jsx
│   ├── vite.config.js          # Vite dev server + /api proxy
│   ├── package.json
│   └── README.md               # Frontend documentation
│
├── .vscode/
│   └── settings.json           # Points VS Code to .venv Python interpreter
└── README.md                   # This file
```

---

## Features

- **Dashboard** — KPI cards (total income, total expenses, net balance, transaction count), monthly income vs. expense bar chart, expense category pie chart, recent transactions list
- **Transactions** — Full CRUD with filters (type, category, date range), pagination (15 per page), soft deletes
- **User Management** — Admin-only portal to create, edit, and delete users
- **Role-Based Access Control (RBAC)**:

  | Role | Create/Edit Transactions | Delete Transactions | Manage Users | View Data |
  |------|--------------------------|--------------------|----|---|
  | **viewer** | ✗ | ✗ | ✗ | ✔ |
  | **analyst** | ✔ | ✗ | ✗ | ✔ |
  | **admin** | ✔ | ✔ | ✔ | ✔ |

---

## Quick Start

### 1. Start the Backend

```bash
cd backend

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start API server
uvicorn app.main:app --reload --port 8000
```

Database tables are created automatically on first run. API available at **http://localhost:8000**, interactive docs at **http://localhost:8000/docs**.

To seed sample data (4 users + 120 transactions):

```bash
python seed_data.py
```

### 2. Start the Frontend

```bash
cd frontend

npm install
npm run dev
```

Opens at **http://localhost:3000**.

---

## Sample Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin — full access |
| `analyst` | `analyst123` | Analyst — read + create/edit transactions |
| `viewer` | `viewer123` | Viewer — read only |

---

## Configuration

Backend configuration in `backend/.env`:

```env
DATABASE_URL=sqlite:///./finance.db
SECRET_KEY=supersecretkey-change-in-production-please
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> **Important:** Change `SECRET_KEY` before deploying to production.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | None | Obtain JWT token |
| GET | `/api/auth/me` | Any | Current user info |
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/{id}` | Admin | Update user |
| DELETE | `/api/users/{id}` | Admin | Delete user |
| GET | `/api/transactions` | Any | List transactions (filters + pagination) |
| POST | `/api/transactions` | Analyst, Admin | Create transaction |
| PUT | `/api/transactions/{id}` | Analyst, Admin | Update transaction |
| DELETE | `/api/transactions/{id}` | Admin | Soft-delete transaction |
| GET | `/api/dashboard/summary` | Any | Aggregated KPIs and chart data |

Full interactive docs: **http://localhost:8000/docs**

---

## Further Reading

- [Backend README](backend/README.md) — detailed setup, full API reference, data models, switching to PostgreSQL
- [Frontend README](frontend/README.md) — pages, components, auth flow, Tailwind custom classes
