"""
Integration tests using an in-memory SQLite DB (no Postgres required).
Run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

SQLITE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def admin_token(client):
    # Create admin via direct DB insert
    from app.auth import hash_password
    from app.models import User, RoleEnum

    db = TestingSession()
    admin = User(
        email="testadmin@finance.com",
        username="testadmin",
        hashed_password=hash_password("admin123"),
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    db.close()

    resp = client.post("/api/auth/login", data={"username": "testadmin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def viewer_token(client):
    from app.auth import hash_password
    from app.models import User, RoleEnum

    db = TestingSession()
    viewer = User(
        email="testviewer@finance.com",
        username="testviewer",
        hashed_password=hash_password("viewer123"),
        role=RoleEnum.viewer,
    )
    db.add(viewer)
    db.commit()
    db.close()

    resp = client.post("/api/auth/login", data={"username": "testviewer", "password": "viewer123"})
    return resp.json()["access_token"]


class TestAuth:
    def test_login_success(self, client, admin_token):
        assert admin_token is not None

    def test_login_wrong_password(self, client):
        resp = client.post("/api/auth/login", data={"username": "testadmin", "password": "wrong"})
        assert resp.status_code == 401

    def test_me_endpoint(self, client, admin_token):
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["username"] == "testadmin"


class TestTransactions:
    def test_create_transaction_as_admin(self, client, admin_token):
        payload = {
            "amount": "1500.00",
            "type": "income",
            "category": "Salary",
            "transaction_date": "2025-01-15",
            "description": "January salary",
        }
        resp = client.post(
            "/api/transactions/",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 201
        assert resp.json()["category"] == "Salary"

    def test_create_transaction_as_viewer_forbidden(self, client, viewer_token):
        payload = {
            "amount": "500.00",
            "type": "expense",
            "category": "Groceries",
            "transaction_date": "2025-01-20",
        }
        resp = client.post(
            "/api/transactions/",
            json=payload,
            headers={"Authorization": f"Bearer {viewer_token}"},
        )
        assert resp.status_code == 403

    def test_list_transactions_as_viewer(self, client, viewer_token):
        resp = client.get(
            "/api/transactions/",
            headers={"Authorization": f"Bearer {viewer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data

    def test_invalid_amount(self, client, admin_token):
        payload = {
            "amount": "-100",
            "type": "expense",
            "category": "Rent",
            "transaction_date": "2025-01-10",
        }
        resp = client.post(
            "/api/transactions/",
            json=payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 422


class TestDashboard:
    def test_summary_accessible_by_viewer(self, client, viewer_token):
        resp = client.get(
            "/api/dashboard/summary",
            headers={"Authorization": f"Bearer {viewer_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "total_income" in data
        assert "net_balance" in data
        assert "monthly_trends" in data
