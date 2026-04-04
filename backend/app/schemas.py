from datetime import datetime, date
import re
from typing import Optional
from decimal import Decimal

from pydantic import BaseModel, field_validator, ConfigDict

from app.models import RoleEnum, TransactionTypeEnum


# ─────────────────────────── Auth ───────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ─────────────────────────── User ───────────────────────────

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    role: RoleEnum = RoleEnum.viewer

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").isalnum():
            raise ValueError("Username must be alphanumeric (underscores allowed)")
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[RoleEnum] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: RoleEnum
    is_active: bool
    created_at: datetime


# ─────────────────────────── Transaction ───────────────────────────

class TransactionCreate(BaseModel):
    amount: Decimal
    type: TransactionTypeEnum
    category: str
    transaction_date: date
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

    @field_validator("category")
    @classmethod
    def category_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Category cannot be empty")
        return v.strip()


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = None
    type: Optional[TransactionTypeEnum] = None
    category: Optional[str] = None
    transaction_date: Optional[date] = None
    description: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: Decimal
    type: TransactionTypeEnum
    category: str
    transaction_date: date
    description: Optional[str]
    notes: Optional[str]
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]


class TransactionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[TransactionResponse]


# ─────────────────────────── Dashboard ───────────────────────────

class CategoryTotal(BaseModel):
    category: str
    total: Decimal


class MonthlyTrend(BaseModel):
    year: int
    month: int
    income: Decimal
    expense: Decimal
    net: Decimal


class DashboardSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    transaction_count: int
    income_by_category: list[CategoryTotal]
    expense_by_category: list[CategoryTotal]
    recent_transactions: list[TransactionResponse]
    monthly_trends: list[MonthlyTrend]
