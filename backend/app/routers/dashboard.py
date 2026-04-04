from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_active_user
from app.models import Transaction, TransactionTypeEnum, User
from app.schemas import (
    CategoryTotal,
    DashboardSummary,
    MonthlyTrend,
    TransactionResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_active_user),
    year: int = Query(None, description="Filter by year (e.g. 2025)"),
):
    """All authenticated users: Get aggregated dashboard summary."""
    base_query = db.query(Transaction).filter(Transaction.is_deleted == False)  # noqa: E712
    if year:
        base_query = base_query.filter(extract("year", Transaction.transaction_date) == year)

    # ── Totals ──────────────────────────────────────────────────────────────
    income_total = (
        base_query.filter(Transaction.type == TransactionTypeEnum.income)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
    )
    expense_total = (
        base_query.filter(Transaction.type == TransactionTypeEnum.expense)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
    )
    total_income = Decimal(str(income_total))
    total_expenses = Decimal(str(expense_total))
    net_balance = total_income - total_expenses
    transaction_count = base_query.count()

    # ── Category breakdowns ──────────────────────────────────────────────────
    income_by_category = (
        base_query.filter(Transaction.type == TransactionTypeEnum.income)
        .with_entities(Transaction.category, func.sum(Transaction.amount).label("total"))
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    expense_by_category = (
        base_query.filter(Transaction.type == TransactionTypeEnum.expense)
        .with_entities(Transaction.category, func.sum(Transaction.amount).label("total"))
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    # ── Recent transactions ─────────────────────────────────────────────────
    recent = (
        base_query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .limit(10)
        .all()
    )

    # ── Monthly trends ──────────────────────────────────────────────────────
    monthly_raw = (
        db.query(
            extract("year", Transaction.transaction_date).label("year"),
            extract("month", Transaction.transaction_date).label("month"),
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(Transaction.is_deleted == False)  # noqa: E712
        .group_by("year", "month", Transaction.type)
        .order_by("year", "month")
        .all()
    )

    monthly_map: dict[tuple, dict] = {}
    for row in monthly_raw:
        key = (int(row.year), int(row.month))
        if key not in monthly_map:
            monthly_map[key] = {"income": Decimal("0"), "expense": Decimal("0")}
        monthly_map[key][row.type.value] += Decimal(str(row.total))

    monthly_trends = [
        MonthlyTrend(
            year=k[0],
            month=k[1],
            income=v["income"],
            expense=v["expense"],
            net=v["income"] - v["expense"],
        )
        for k, v in sorted(monthly_map.items())
    ]

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        transaction_count=transaction_count,
        income_by_category=[
            CategoryTotal(category=r.category, total=Decimal(str(r.total)))
            for r in income_by_category
        ],
        expense_by_category=[
            CategoryTotal(category=r.category, total=Decimal(str(r.total)))
            for r in expense_by_category
        ],
        recent_transactions=recent,
        monthly_trends=monthly_trends,
    )
