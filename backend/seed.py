"""
Seed script: populates the database with sample users and transactions.

Run from the backend/ directory:
    python seed.py
"""
import sys
import os
from datetime import date, timedelta
from decimal import Decimal
import random

# Ensure the app module is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app.models import User, Transaction, RoleEnum, TransactionTypeEnum
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

SAMPLE_USERS = [
    {
        "email": "admin@finance.com",
        "username": "admin",
        "password": "admin123",
        "full_name": "Alice Admin",
        "role": RoleEnum.admin,
    },
    {
        "email": "analyst@finance.com",
        "username": "analyst",
        "password": "analyst123",
        "full_name": "Bob Analyst",
        "role": RoleEnum.analyst,
    },
    {
        "email": "viewer@finance.com",
        "username": "viewer",
        "password": "viewer123",
        "full_name": "Carol Viewer",
        "role": RoleEnum.viewer,
    },
    {
        "email": "analyst2@finance.com",
        "username": "analyst2",
        "password": "analyst123",
        "full_name": "David Analyst",
        "role": RoleEnum.analyst,
    },
]

INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Rental", "Bonus", "Other Income"]
EXPENSE_CATEGORIES = [
    "Rent", "Utilities", "Groceries", "Transport", "Healthcare",
    "Entertainment", "Subscriptions", "Insurance", "Office Supplies", "Marketing",
]

DESCRIPTIONS = {
    "Salary": "Monthly salary payment",
    "Freelance": "Freelance project payment",
    "Investment": "Dividend / interest payout",
    "Rental": "Monthly rental income",
    "Bonus": "Annual performance bonus",
    "Other Income": "Miscellaneous income",
    "Rent": "Monthly office/home rent",
    "Utilities": "Electricity, water, internet",
    "Groceries": "Weekly grocery run",
    "Transport": "Fuel and commute costs",
    "Healthcare": "Medical expenses",
    "Entertainment": "Team outing / events",
    "Subscriptions": "Software subscription",
    "Insurance": "Annual insurance premium",
    "Office Supplies": "Stationery and supplies",
    "Marketing": "Digital marketing spend",
}


def random_date_in_last_18_months() -> date:
    today = date.today()
    start = today - timedelta(days=18 * 30)
    delta = (today - start).days
    return start + timedelta(days=random.randint(0, delta))


def seed():
    db = SessionLocal()
    try:
        # ── Users ──────────────────────────────────────────────────
        created_users = []
        for u in SAMPLE_USERS:
            existing = db.query(User).filter(User.username == u["username"]).first()
            if existing:
                print(f"  [skip] User '{u['username']}' already exists")
                created_users.append(existing)
                continue
            user = User(
                email=u["email"],
                username=u["username"],
                hashed_password=hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            db.add(user)
            db.flush()
            created_users.append(user)
            print(f"  [+] User '{user.username}' ({user.role.value}) created")

        db.commit()

        # Refresh to get IDs
        for u in created_users:
            db.refresh(u)

        admin_user = next(u for u in created_users if u.role == RoleEnum.admin)
        analyst_users = [u for u in created_users if u.role == RoleEnum.analyst]

        # ── Transactions ───────────────────────────────────────────
        existing_count = db.query(Transaction).count()
        if existing_count > 0:
            print(f"  [skip] {existing_count} transactions already exist — skipping seed")
            return

        transactions = []
        creators = [admin_user] + analyst_users

        for _ in range(120):
            is_income = random.random() < 0.4  # 40% income, 60% expense
            txn_type = TransactionTypeEnum.income if is_income else TransactionTypeEnum.expense
            category = random.choice(INCOME_CATEGORIES if is_income else EXPENSE_CATEGORIES)
            amount = Decimal(str(round(random.uniform(100, 15000), 2)))
            creator = random.choice(creators)

            txn = Transaction(
                amount=amount,
                type=txn_type,
                category=category,
                transaction_date=random_date_in_last_18_months(),
                description=DESCRIPTIONS.get(category, ""),
                notes=f"Auto-seeded record #{_ + 1}",
                created_by=creator.id,
            )
            transactions.append(txn)

        db.add_all(transactions)
        db.commit()
        print(f"  [+] {len(transactions)} sample transactions created")
        print("\nSeed complete!")
        print("\nLogin credentials:")
        for u in SAMPLE_USERS:
            print(f"  {u['username']:12s} / {u['password']:12s}  → role: {u['role'].value}")

    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database...")
    seed()
