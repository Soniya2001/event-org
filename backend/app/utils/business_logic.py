from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.task import Task
from app.models.event import Event

def calculate_budget_reconciliation(event: Event, db: Session) -> Dict[str, Any]:
    """
    Deterministic backend calculation for all budget totals, dynamically
    calculated percentages, actual spending, and remaining balance.
    Guarantees that mathematical operations do not rely on LLM estimates.
    """
    budgets = db.query(Budget).filter(Budget.event_id == event.id).all()
    expenses = db.query(Expense).filter(Expense.event_id == event.id).all()
    
    total_allocated = sum(b.allocated_amount for b in budgets)
    total_estimated = sum(b.estimated_amount for b in budgets)
    total_actual = sum(e.amount for e in expenses)
    
    # Update actual_amount per budget category
    for b in budgets:
        cat_actual = sum(e.amount for e in expenses if e.category.lower() == b.category.lower() or e.budget_id == b.id)
        b.actual_amount = round(cat_actual, 2)
        if event.total_budget > 0:
            b.percentage = round((b.allocated_amount / event.total_budget) * 100, 2)
        else:
            b.percentage = 0.0
            
    db.commit()

    remaining_balance = round(event.total_budget - total_actual, 2)
    is_over_budget = total_actual > event.total_budget or total_allocated > event.total_budget

    return {
        "total_budget": round(event.total_budget, 2),
        "total_allocated": round(total_allocated, 2),
        "total_estimated": round(total_estimated, 2),
        "total_actual": round(total_actual, 2),
        "remaining_balance": remaining_balance,
        "is_over_budget": is_over_budget,
        "categories": budgets
    }

def recalculate_event_progress(event_id: int, db: Session) -> int:
    """
    Calculates event planning progress dynamically based on task completion.
    Completed tasks proportionately advance the event progress.
    """
    tasks = db.query(Task).filter(Task.event_id == event_id).all()
    if not tasks:
        progress = 10  # Baseline draft created
    else:
        completed = sum(1 for t in tasks if t.status == "COMPLETED")
        progress = int((completed / len(tasks)) * 100)
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        event.progress = progress
        if progress == 100:
            event.status = "Completed"
        elif progress > 10 and event.status == "Draft":
            event.status = "Planning"
        db.commit()
    return progress

def sanitize_and_reconcile_ai_budget(raw_budget_items: List[Dict[str, Any]], total_budget: float) -> List[Dict[str, Any]]:
    """
    Ensures that AI-generated category allocations strictly reconcile to exactly 100%
    of the event's total budget without silent drift or excess.
    """
    if not raw_budget_items or total_budget <= 0:
        return raw_budget_items

    # Extract or infer raw weights
    raw_totals = sum(item.get("estimated_cost", 0.0) for item in raw_budget_items)
    
    reconciled = []
    accumulated = 0.0
    num_items = len(raw_budget_items)

    for i, item in enumerate(raw_budget_items):
        if raw_totals > 0:
            weight = item.get("estimated_cost", 0.0) / raw_totals
        else:
            weight = 1.0 / num_items

        if i == num_items - 1:
            # Adjust final item so the sum is exact to the cent
            cost = round(total_budget - accumulated, 2)
        else:
            cost = round(total_budget * weight, 2)
            accumulated += cost

        percentage = round((cost / total_budget) * 100, 2) if total_budget > 0 else 0.0
        
        reconciled.append({
            "category": item.get("category", "General"),
            "estimated_cost": max(cost, 0.0),
            "percentage": percentage,
            "explanation": item.get("explanation", ""),
            "cost_saving_suggestions": item.get("cost_saving_suggestions", "Consider comparing quotes across multiple vendors.")
        })

    return reconciled

