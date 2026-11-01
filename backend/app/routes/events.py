from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=List[EventResponse])
def get_user_events(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter events by status (Planning, Upcoming, Completed)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all events owned by the authenticated user.
    Supports optional status filtering and orders events by latest creation date.
    """
    query = db.query(Event).filter(Event.user_id == current_user.id)
    if status_filter:
        query = query.filter(Event.status.ilike(f"%{status_filter}%"))
    return query.order_by(Event.created_at.desc()).all()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new event record with user preferences, guest headcount, and target budget.
    Initializes planning workflow at 10% progress.
    """
    new_event = Event(
        user_id=current_user.id,
        event_name=event_in.event_name,
        event_type=event_in.event_type,
        event_date=event_in.event_date,
        location=event_in.location,
        guest_count=event_in.guest_count,
        total_budget=event_in.total_budget,
        currency=event_in.currency or current_user.currency,
        preferences=event_in.preferences or {},
        status="Planning",
        progress=10,
        ai_plan={}
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed metadata and AI blueprint for a specific event.
    Enforces strict tenant isolation preventing cross-account access.
    """
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update core event parameters such as guest count, budget, status, or preferences.
    """
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    
    update_data = event_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)

    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete an event and all associated tasks, budgets, and expenses.
    """
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    
    db.delete(event)
    db.commit()
    return None
