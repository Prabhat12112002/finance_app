# Finance Data Processing & Access Control — Backend

FastAPI backend for the Finance Dashboard system, featuring JWT authentication, role-based access control, financial record management, and aggregated dashboard analytics. Data is stored in a local SQLite file (`finance.db`).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.129+ |
| ORM | SQLAlchemy 2.x |
| Database | SQLite (local file) / PostgreSQL (production) |
| Auth | PyJWT (HS256) + PBKDF2-HMAC-SHA256 password hashing |
| Validation | Pydantic v2 |
| Runtime | Python 3.12+ (tested on 3.14) |
| Virtual Env | `.venv` (created with `python -m venv .venv`) |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app, CORS, router registration
│   ├── config.py         # Settings loaded from .env
│   ├── database.py       # SQLAlchemy engine, session, Base
│   ├── models.py         # ORM models: User, Transaction
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── auth.py           # JWT encode/decode, password hash/verify
│   ├── dependencies.py   # Auth guards: get_current_user, require_roles()
│   └── routers/
│       ├── auth.py           # POST /api/auth/login, GET /api/auth/me
│       ├── users.py          # CRUD /api/users/ (admin only)
│       ├── transactions.py   # CRUD /api/transactions/ + filters
│       └── dashboard.py      # GET /api/dashboard/summary
├── tests/
│   └── test_api.py       # Integration tests using in-memory SQLite
├── .env                  # Environment variables
├── finance.db            # SQLite database (auto-created on first run)
├── requirements.txt      # Python dependencies
└── seed.py               # Populates DB with sample users & transactions
```

---

## Setup

### 1. Create & activate virtual environment

```bash
cd backend

# Create
python -m venv .venv

# Activate — Windows
.\.venv\Scripts\activate

# Activate — macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic "pydantic-settings" PyJWT python-multipart httpx pytest pytest-asyncio
```

### 3. Configure environment

Edit `.env` to adjust settings (defaults work out of the box for local SQLite):

```env
# SQLite (default — no extra setup needed)
DATABASE_URL=sqlite:///./finance.db

# JWT
SECRET_KEY=supersecretkey-change-in-production-please
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Start the server

```bash
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Tables are auto-created on the first startup.

### 5. Seed sample data

```bash
.\.venv\Scripts\python.exe seed.py
```

Creates 4 users and 120 randomised transactions spanning the past 18 months.

---

## Sample Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin — full access |
| `analyst` | `analyst123` | Analyst — read + create/edit transactions |
| `viewer` | `viewer123` | Viewer — read only |
| `analyst2` | `analyst123` | Analyst |

---

## API Endpoints

Interactive docs: **http://localhost:8000/docs**

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | — | Login, returns JWT token |
| `GET` | `/api/auth/me` | Any | Get current user profile |

**Login format** — `application/x-www-form-urlencoded`:
```
username=admin&password=admin123
```

### Users

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/` | Admin | Create a new user |
| `GET` | `/api/users/` | Admin | List all users |
| `GET` | `/api/users/{id}` | Admin / Self | Get user by ID |
| `PATCH` | `/api/users/{id}` | Admin | Update role / active status |
| `DELETE` | `/api/users/{id}` | Admin | Delete user |

### Transactions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/transactions/` | Admin, Analyst | Create transaction |
| `GET` | `/api/transactions/` | All | List with filters & pagination |
| `GET` | `/api/transactions/{id}` | All | Get single transaction |
| `PATCH` | `/api/transactions/{id}` | Admin, Analyst | Update transaction |
| `DELETE` | `/api/transactions/{id}` | Admin | Soft-delete transaction |

**Query params for listing:**

| Param | Type | Example |
|-------|------|---------|
| `type` | `income` \| `expense` | `?type=expense` |
| `category` | string (partial match) | `?category=rent` |
| `date_from` | `YYYY-MM-DD` | `?date_from=2025-01-01` |
| `date_to` | `YYYY-MM-DD` | `?date_to=2025-12-31` |
| `page` | int (default 1) | `?page=2` |
| `page_size` | int (default 20, max 100) | `?page_size=50` |

### Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard/summary` | All | Aggregated summary |

**Optional query param:** `?year=2025` — filters all aggregations to a specific year. Omit for all-time data.

**Response includes:**
- `total_income`, `total_expenses`, `net_balance`, `transaction_count`
- `income_by_category` — list of category totals
- `expense_by_category` — list of category totals
- `recent_transactions` — last 10 transactions
- `monthly_trends` — month-by-month income / expense / net

---

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View dashboard & transactions | ✔ | ✔ | ✔ |
| Create transactions | ✗ | ✔ | ✔ |
| Edit transactions | ✗ | ✔ | ✔ |
| Delete transactions (soft) | ✗ | ✗ | ✔ |
| View user list | ✗ | ✗ | ✔ |
| Create / edit / delete users | ✗ | ✗ | ✔ |

Access control is enforced via the `require_roles()` dependency injected on each endpoint.

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | int PK | Auto-increment |
| `email` | string | Unique |
| `username` | string | Unique, alphanumeric + underscore |
| `hashed_password` | string | PBKDF2-HMAC-SHA256 with salt |
| `full_name` | string | Optional |
| `role` | enum | `viewer` / `analyst` / `admin` |
| `is_active` | bool | Default `true` |
| `created_at` | datetime | Auto |
| `updated_at` | datetime | Auto |

### Transaction

| Field | Type | Notes |
|-------|------|-------|
| `id` | int PK | Auto-increment |
| `amount` | decimal(15,2) | Must be > 0 |
| `type` | enum | `income` / `expense` |
| `category` | string | Free text |
| `transaction_date` | date | Required |
| `description` | string | Optional |
| `notes` | string | Optional |
| `is_deleted` | bool | Soft-delete flag |
| `created_by` | int FK | References `users.id` |
| `created_at` | datetime | Auto |
| `updated_at` | datetime | Auto |

---

## Running Tests

Tests use an **in-memory SQLite database** — no running server or database required:

```bash
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

Covers:
- Login success and failure
- JWT `/me` endpoint
- Role-based access control (403 for forbidden roles)
- Transaction creation and validation
- Dashboard summary accessibility

---

## Switching to PostgreSQL

1. Install `psycopg2-binary`:
   ```bash
   pip install psycopg2-binary
   ```

2. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/financedb
   ```

3. Restart the server — SQLAlchemy handles the rest.

---

## Design Notes

- **Passwords** use PBKDF2-HMAC-SHA256 (260,000 iterations) via Python's `hashlib` — no third-party C extension required, compatible with Python 3.14.
- **JWT** uses PyJWT (HS256). Tokens expire after 60 minutes by default.
- **Soft deletes** on transactions preserve historical data — records are never permanently removed via the API.
- **Auto table creation** on startup (`Base.metadata.create_all`) simplifies development. For production, use Alembic migrations.
- **CORS** is configured to allow `http://localhost:3000` and `http://localhost:5173` (Vite defaults).
