from app.utils.business_logic import sanitize_and_reconcile_ai_budget, recalculate_event_progress
from app.models.event import Event
from app.models.task import Task
from app.models.budget import Budget
from app.models.expense import Expense

def test_budget_reconciliation_exact_cent_accuracy():
    raw_items = [
        {"category": "Venue", "estimated_cost": 3000.0},
        {"category": "Catering", "estimated_cost": 3500.0},
        {"category": "Decor", "estimated_cost": 1500.0},
        {"category": "Photography", "estimated_cost": 1000.0},
        {"category": "Contingency", "estimated_cost": 500.0},
    ]
    target_budget = 10000.0
    reconciled = sanitize_and_reconcile_ai_budget(raw_items, target_budget)
    
    total = sum(item["estimated_cost"] for item in reconciled)
    total_pct = sum(item["percentage"] for item in reconciled)

    # Exact equality to the target budget without drift
    assert abs(total - target_budget) < 0.001
    assert abs(total_pct - 100.0) < 0.5

def test_budget_reconciliation_zero_budget_edge_case():
    raw_items = [{"category": "Venue", "estimated_cost": 100.0}]
    reconciled = sanitize_and_reconcile_ai_budget(raw_items, 0.0)
    assert len(reconciled) == 1

def test_task_progress_recalculation_lifecycle(db_session):
    # Setup test event
    event = Event(
        user_id=1,
        event_name="Progress Test Gala",
        event_type="Corporate",
        event_date="2026-12-31",
        location="Convention Center",
        guest_count=100,
        total_budget=5000.0,
        currency="USD",
        status="Draft",
        progress=0
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)

    # 1. Zero tasks -> baseline progress
    p0 = recalculate_event_progress(event.id, db_session)
    assert p0 == 10

    # 2. Add two tasks (both pending) -> 0% completed
    t1 = Task(event_id=event.id, title="Task 1", due_date="2026-12-01", status="PENDING")
    t2 = Task(event_id=event.id, title="Task 2", due_date="2026-12-15", status="PENDING")
    db_session.add_all([t1, t2])
    db_session.commit()

    p_half = recalculate_event_progress(event.id, db_session)
    assert p_half == 0

    # 3. Complete 1 of 2 tasks -> 50%
    t1.status = "COMPLETED"
    db_session.commit()
    p_half_done = recalculate_event_progress(event.id, db_session)
    assert p_half_done == 50

    # 4. Complete all tasks -> 100% and auto-mark event as Completed
    t2.status = "COMPLETED"
    db_session.commit()
    p_all_done = recalculate_event_progress(event.id, db_session)
    assert p_all_done == 100

    db_session.refresh(event)
    assert event.status == "Completed"
