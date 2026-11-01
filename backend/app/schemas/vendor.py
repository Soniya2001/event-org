from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any

class VendorCreate(BaseModel):
    name: str
    category: str
    contact_details: Optional[Dict[str, Any]] = None
    estimated_quote: Optional[float] = Field(default=0.0, ge=0.0)
    actual_quote: Optional[float] = Field(default=0.0, ge=0.0)
    booking_status: Optional[str] = "NOT_CONTACTED"
    payment_status: Optional[str] = "UNPAID"
    selection_criteria: Optional[str] = ""
    booking_deadline: Optional[str] = None
    notes: Optional[str] = ""

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact_details: Optional[Dict[str, Any]] = None
    estimated_quote: Optional[float] = Field(default=None, ge=0.0)
    actual_quote: Optional[float] = Field(default=None, ge=0.0)
    booking_status: Optional[str] = None
    payment_status: Optional[str] = None
    selection_criteria: Optional[str] = None
    booking_deadline: Optional[str] = None
    notes: Optional[str] = None

class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    name: str
    category: str
    contact_details: Optional[Dict[str, Any]] = None
    estimated_quote: float
    actual_quote: float
    booking_status: str
    payment_status: str
    selection_criteria: Optional[str] = ""
    booking_deadline: Optional[str] = None
    notes: Optional[str] = ""
