from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.event import Event
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetOverviewResponse
from app.utils.dependencies import get_current_user
from app.utils.business_logic import calculate_budget_reconciliation

router = APIRouter(prefix="/budgets", tags=["Budgets"])

def get_verified_event(event_id: int, user: User, db: Session) -> Event:
    """Helper verifying event existence and ownership."""
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.get("/{event_id}", response_model=BudgetOverviewResponse)
def get_event_budget(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive financial health overview for an event.
    Calculates total allocated, estimated, actual expenses, remaining balance, and over-budget status.
    """
    event = get_verified_event(event_id, current_user, db)
    reconciled = calculate_budget_reconciliation(event, db)
    return reconciled

@router.post("/{event_id}", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def add_budget_category(
    event_id: int,
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a customized budget envelope (e.g. Venue, Catering, Audio/Visual).
    Automatically calculates percentage against total allocated event funds.
    """
    event = get_verified_event(event_id, current_user, db)
    
    percentage = 0.0
    if event.total_budget > 0:
        percentage = round((budget_in.allocated_amount / event.total_budget) * 100, 2)

    new_budget = Budget(
        event_id=event.id,
        category=budget_in.category,
        allocated_amount=budget_in.allocated_amount,
        estimated_amount=budget_in.estimated_amount or budget_in.allocated_amount,
        actual_amount=budget_in.actual_amount or 0.0,
        percentage=percentage,
        notes=budget_in.notes or "",
        savings_tip=budget_in.savings_tip or ""
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    calculate_budget_reconciliation(event, db)
    return new_budget

@router.put("/{event_id}/{budget_id}", response_model=BudgetResponse)
def update_budget_category(
    event_id: int,
    budget_id: int,
    budget_update: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update budget allocation or cost projections and trigger real-time financial recalculation.
    """
    event = get_verified_event(event_id, current_user, db)
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.event_id == event.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget category not found")

    update_data = budget_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(budget, field, val)

    if event.total_budget > 0:
        budget.percentage = round((budget.allocated_amount / event.total_budget) * 100, 2)

    db.commit()
    db.refresh(budget)
    calculate_budget_reconciliation(event, db)
    return budget

@router.delete("/{event_id}/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_category(
    event_id: int,
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a budget line item and rebalance the event financial summary.
    """
    event = get_verified_event(event_id, current_user, db)
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.event_id == event.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget category not found")
    
    db.delete(budget)
    db.commit()
    calculate_budget_reconciliation(event, db)
    return None
