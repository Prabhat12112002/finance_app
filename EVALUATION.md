# Finance Data Processing – Assignment Evaluation

This document outlines how the **Finance Data Processing and Access Control Backend** matches the requested assignment criteria, along with the assumptions and tradeoffs made during development.

## 1. Core Requirements Addressed

### User and Role Management
- **Implementation**: The system includes a fully functional User model with `viewer`, `analyst`, and `admin` roles, authenticated via JWT. 
- **API**: Endpoints for creating, listing, updating (including `is_active` status and role), and deleting users are implemented in `app/routers/users.py`.
- **Access Control**: Roles are strictly enforced using the `require_roles` dependency guard in `app/dependencies.py`.

### Financial Records Management
- **Implementation**: Transactions include `amount`, `type` (`income` or `expense`), `category`, `transaction_date`, `description`, and `notes`. 
- **API**: Full CRUD operations exist under `/api/transactions`, with support for advanced filtering (by date, type, category) and pagination.

### Dashboard Summary APIs
- **Implementation**: An aggregated data endpoint `/api/dashboard/summary` operates directly via SQLAlchemy to calculate `total_income`, `total_expenses`, `net_balance`, `category-wise groupings`, recent transactions, and `monthly trends`.

### Access Control Logic
The `require_roles` Dependency in FastAPI enforces the following rules seamlessly:
- **Viewer**: Read-only access to dashboard and transactions.
- **Analyst**: Can create and edit their transactions.
- **Admin**: Full access, including soft-deleting transactions and full user management capabilities.

### Validation and Error Handling
- **Implementation**: Pydantic v2 is used comprehensively. Schemas (in `app/schemas.py`) enforce criteria such as:
  - Valid username patterns, structure, and sizes.
  - Ensuring transaction properties (like `amount`) are strictly positive integers/decimals.
- Attempting illegal actions (e.g., unauthorized access, fetching missing rows, or deleting your own user account) strictly yield defined `403` or `404` errors rather than server crashes.

### Data Persistence
- Built via **SQLAlchemy ORM** backed by **SQLite** (`finance.db`) for portability and ease of setup, though it can seamlessly transition to PostgreSQL for production environments via updating the `.env`.

---

## 2. Optional Enhancements Completed
- **Authentication**: JWT token-based authentication using PyJWT. Passwords hashed robustly using PBKDF2-HMAC-SHA256 standard library implementations.
- **Pagination**: Implemented natively in the `/api/transactions` list endpoint. 
- **Soft Delete**: Applied via an `is_deleted` boolean flag on the `Transaction` model. Safe data preservation is handled accurately—deleted items are ignored from dashboard calculations and transaction listings.
- **Rate Limiting**: Integrated `slowapi` to protect authentication endpoints (`/api/auth/login`) from brute force and abusive requests.
- **Search Support**: Filter endpoint queries implicitly match category snippets via case-insensitive `ILIKE` operations.
- **Unit Tests**: Integrated `pytest` leveraging an in-memory SQLite schema providing excellent, fast test coverage of the API.
- **API Documentation**: FastAPI automatically provisions Swagger UI and ReDoc documentation at `/docs` reflecting all schema validations.

---

## 3. Assumptions and Tradeoffs

1. **Tradeoff - Built-in Python Hashing over Passlib/Bcrypt:**
   - *Reasoning*: Python explicitly phased out default `crypt` packages in 3.13+. To ensure robust future compatibility without relying on unmaintained third-party extensions (like `passlib` or binaries like `bcrypt`), standard library `hashlib.pbkdf2_hmac` was utilized. It provides equivalent security levels for assessment purposes.

2. **Assumption - Dashboard Aggregations Processed by DB Engine:**
   - *Reasoning*: All calculations for the dashboard are pushed to the database (using `func.sum()` and `group_by`) via SQLAlchemy rather than querying all objects into memory in Python. 
   - *Tradeoff*: While this puts computational load onto the DB layer, it handles thousands of transactions seamlessly compared to high memory bounds pulling raw objects in-app.

3. **Tradeoff - SQLite vs. Dedicated PostgreSQL Server for Assessment:**
   - *Reasoning*: SQLite drastically simplifies the review pipeline, allowing immediate "plug and play" capabilities without needing external Docker servers or local PostgreSQL services initialized.

4. **Assumption - Soft Deletes Implementation Context:**
   - *Reasoning*: Since it's a tracking dashboard, "deleting" operations often lead to destructive data behavior. Deletions are limited to Admins and operate as "soft deletes" so audits can still be theoretically performed. 
