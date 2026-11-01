import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text, default="")
    expense_date = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Composite performance indexes
    __table_args__ = (
        Index("ix_expenses_event_date", "event_id", "expense_date"),
        Index("ix_expenses_event_category", "event_id", "category"),
    )

    # Relationships
    event = relationship("Event", back_populates="expenses")
    budget = relationship("Budget", back_populates="expenses")
