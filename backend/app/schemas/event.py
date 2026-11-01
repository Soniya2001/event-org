import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any, Dict, List

class EventCreate(BaseModel):
    event_name: str
    event_type: str
    event_date: str
    location: str
    guest_count: int = Field(default=50, ge=1)
    total_budget: float = Field(default=0.0, ge=0.0)
    currency: str = "USD"
    preferences: Optional[Dict[str, Any]] = None

class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    location: Optional[str] = None
    guest_count: Optional[int] = None
    total_budget: Optional[float] = None
    currency: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    ai_plan: Optional[Dict[str, Any]] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    event_name: str
    event_type: str
    event_date: str
    location: str
    guest_count: int
    total_budget: float
    currency: str
    preferences: Optional[Dict[str, Any]] = None
    status: str
    progress: int
    ai_plan: Optional[Dict[str, Any]] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

class EventSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_name: str
    event_type: str
    event_date: str
    location: str
    guest_count: int
    total_budget: float
    currency: str
    status: str
    progress: int
    created_at: datetime.datetime
