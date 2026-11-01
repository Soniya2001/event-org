from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.event import Event
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.utils.dependencies import get_current_user
from app.utils.business_logic import calculate_budget_reconciliation

router = APIRouter(prefix="/expenses", tags=["Expenses"])

def get_verified_event(event_id: int, user: User, db: Session) -> Event:
    """Helper verifying event existence and ownership."""
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.get("/{event_id}", response_model=List[ExpenseResponse])
def get_event_expenses(
    event_id: int,
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=200, description="Pagination limit"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all actual recorded transactions and receipts for an event with pagination, ordered by date descending.
    """
    event = get_verified_event(event_id, current_user, db)
    return db.query(Expense).filter(Expense.event_id == event.id).order_by(
        Expense.expense_date.desc(), Expense.id.desc()
    ).offset(skip).limit(limit).all()

@router.post("/{event_id}", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    event_id: int,
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record an actual vendor or logistical expense. Automatically updates budget ledger and remaining balance.
    """
    event = get_verified_event(event_id, current_user, db)
    
    new_expense = Expense(
        event_id=event.id,
        budget_id=expense_in.budget_id,
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description or "",
        expense_date=expense_in.expense_date
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    calculate_budget_reconciliation(event, db)
    return new_expense

@router.put("/{event_id}/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    event_id: int,
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update expense receipt details and recalculate cumulative spending totals.
    """
    event = get_verified_event(event_id, current_user, db)
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.event_id == event.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found")

    update_data = expense_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(expense, field, val)

    db.commit()
    db.refresh(expense)
    calculate_budget_reconciliation(event, db)
    return expense

@router.delete("/{event_id}/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    event_id: int,
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an expense item and return the funds to the remaining balance.
    """
    event = get_verified_event(event_id, current_user, db)
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.event_id == event.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found")

    db.delete(expense)
    db.commit()
    calculate_budget_reconciliation(event, db)
    return None
