from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_active_user, require_roles
from app.models import Transaction, TransactionTypeEnum, User, RoleEnum
from app.schemas import (
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdate,
)

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


def _get_transaction_or_404(txn_id: int, db: Session) -> Transaction:
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.is_deleted == False,  # noqa: E712
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.analyst)),
):
    """Admin & Analyst: Create a new financial transaction."""
    txn = Transaction(
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        transaction_date=payload.transaction_date,
        description=payload.description,
        notes=payload.notes,
        created_by=current_user.id,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.get("/", response_model=TransactionListResponse)
def list_transactions(
    db: Session = Depends(get_db),
    _: User = Depends(get_active_user),
    type: Optional[TransactionTypeEnum] = Query(None, description="Filter by type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    date_from: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """All authenticated users: List transactions with optional filters and pagination."""
    query = db.query(Transaction).filter(Transaction.is_deleted == False)  # noqa: E712

    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category.ilike(f"%{category}%"))
    if date_from:
        query = query.filter(Transaction.transaction_date >= date_from)
    if date_to:
        query = query.filter(Transaction.transaction_date <= date_to)

    total = query.count()
    items = (
        query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return TransactionListResponse(total=total, page=page, page_size=page_size, items=items)


@router.get("/{txn_id}", response_model=TransactionResponse)
def get_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_active_user),
):
    """All authenticated users: Get a single transaction."""
    return _get_transaction_or_404(txn_id, db)


@router.patch("/{txn_id}", response_model=TransactionResponse)
def update_transaction(
    txn_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin, RoleEnum.analyst)),
):
    """Admin & Analyst: Update an existing transaction."""
    txn = _get_transaction_or_404(txn_id, db)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(txn, field, value)

    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    """Admin only: Soft-delete a transaction."""
    txn = _get_transaction_or_404(txn_id, db)
    txn.is_deleted = True
    db.commit()
