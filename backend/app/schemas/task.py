import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "General"
    start_date: Optional[str] = None
    due_date: str
    priority: Optional[str] = "MEDIUM"  # LOW, MEDIUM, HIGH, URGENT

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # PENDING, IN_PROGRESS, COMPLETED

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    title: str
    description: Optional[str] = ""
    category: str
    start_date: Optional[str] = None
    due_date: str
    priority: str
    status: str
    completed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
