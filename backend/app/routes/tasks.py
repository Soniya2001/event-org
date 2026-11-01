import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.event import Event
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.utils.dependencies import get_current_user
from app.utils.business_logic import recalculate_event_progress

router = APIRouter(prefix="/tasks", tags=["Tasks"])

def get_verified_event(event_id: int, user: User, db: Session) -> Event:
    """Helper verifying event existence and ownership."""
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.get("/{event_id}", response_model=List[TaskResponse])
def get_event_tasks(
    event_id: int,
    status_filter: Optional[str] = Query(None, alias="status", description="Filter tasks by status (PENDING, IN_PROGRESS, COMPLETED)"),
    priority_filter: Optional[str] = Query(None, alias="priority", description="Filter tasks by priority (LOW, MEDIUM, HIGH, URGENT)"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=200, description="Pagination limit"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all tasks and milestones scheduled for an event with pagination and filters.
    Ordered chronologically by due date.
    """
    event = get_verified_event(event_id, current_user, db)
    query = db.query(Task).filter(Task.event_id == event.id)
    if status_filter:
        query = query.filter(Task.status.ilike(f"%{status_filter}%"))
    if priority_filter:
        query = query.filter(Task.priority.ilike(f"%{priority_filter}%"))
    return query.order_by(Task.due_date.asc()).offset(skip).limit(limit).all()

@router.post("/{event_id}", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    event_id: int,
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new milestone checklist item and recalculate overall event completion progress.
    """
    event = get_verified_event(event_id, current_user, db)
    new_task = Task(
        event_id=event.id,
        title=task_in.title,
        description=task_in.description or "",
        category=task_in.category or "General",
        start_date=task_in.start_date,
        due_date=task_in.due_date,
        priority=task_in.priority or "MEDIUM",
        status="PENDING"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    recalculate_event_progress(event.id, db)
    return new_task

@router.put("/{event_id}/{task_id}", response_model=TaskResponse)
def update_task(
    event_id: int,
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update task details or mark task as COMPLETED. Automatically timestamps completion date
    and dynamically recalculates the event planning progress percentage.
    """
    event = get_verified_event(event_id, current_user, db)
    task = db.query(Task).filter(Task.id == task_id, Task.event_id == event.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    if "status" in update_data:
        if update_data["status"] == "COMPLETED" and task.status != "COMPLETED":
            task.completed_at = datetime.datetime.utcnow()
        elif update_data["status"] != "COMPLETED":
            task.completed_at = None

    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)
    recalculate_event_progress(event.id, db)
    return task

@router.delete("/{event_id}/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    event_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a milestone task and recalculate the remaining completion progress.
    """
    event = get_verified_event(event_id, current_user, db)
    task = db.query(Task).filter(Task.id == task_id, Task.event_id == event.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    recalculate_event_progress(event.id, db)
    return None
