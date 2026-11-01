import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ExpenseCreate(BaseModel):
    category: str
    amount: float = Field(gt=0.0)
    description: Optional[str] = ""
    expense_date: str
    budget_id: Optional[int] = None

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0.0)
    description: Optional[str] = None
    expense_date: Optional[str] = None
    budget_id: Optional[int] = None

class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    budget_id: Optional[int] = None
    category: str
    amount: float
    description: Optional[str] = ""
    expense_date: str
    created_at: datetime.datetime
