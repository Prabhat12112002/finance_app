import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Boolean, Enum, DateTime,
    ForeignKey, Text, Numeric, Date
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    viewer = "viewer"
    analyst = "analyst"
    admin = "admin"


class TransactionTypeEnum(str, enum.Enum):
    income = "income"
    expense = "expense"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    role = Column(Enum(RoleEnum, name='role_enum', create_type=False), default=RoleEnum.viewer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="created_by_user", lazy="dynamic")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    type = Column(Enum(TransactionTypeEnum, name='transaction_type_enum', create_type=False), nullable=False)
    category = Column(String(100), nullable=False)
    transaction_date = Column(Date, nullable=False, default=date.today)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)  # soft delete
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by_user = relationship("User", back_populates="transactions")
