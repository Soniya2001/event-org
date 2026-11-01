from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    allocated_amount = Column(Float, default=0.0, nullable=False)
    estimated_amount = Column(Float, default=0.0, nullable=False)
    actual_amount = Column(Float, default=0.0, nullable=False)
    percentage = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, default="")
    savings_tip = Column(Text, default="")

    # Relationships
    event = relationship("Event", back_populates="budgets")
    expenses = relationship("Expense", back_populates="budget")

