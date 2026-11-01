from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class BudgetCreate(BaseModel):
    category: str
    allocated_amount: float = Field(ge=0.0)
    estimated_amount: Optional[float] = Field(default=0.0, ge=0.0)
    actual_amount: Optional[float] = Field(default=0.0, ge=0.0)
    notes: Optional[str] = ""
    savings_tip: Optional[str] = ""

class BudgetUpdate(BaseModel):
    allocated_amount: Optional[float] = Field(default=None, ge=0.0)
    estimated_amount: Optional[float] = Field(default=None, ge=0.0)
    actual_amount: Optional[float] = Field(default=None, ge=0.0)
    notes: Optional[str] = None
    savings_tip: Optional[str] = None

class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    category: str
    allocated_amount: float
    estimated_amount: float
    actual_amount: float
    percentage: float
    notes: Optional[str] = ""
    savings_tip: Optional[str] = ""

class BudgetOverviewResponse(BaseModel):
    total_budget: float
    total_allocated: float
    total_estimated: float
    total_actual: float
    remaining_balance: float
    is_over_budget: bool
    categories: List[BudgetResponse]
