import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_name = Column(String(255), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_date = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    guest_count = Column(Integer, default=50, nullable=False)
    total_budget = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    preferences = Column(JSON, default=dict)
    status = Column(String(50), default="Planning", nullable=False)  # Draft, Planning, Confirmed, Completed
    progress = Column(Integer, default=0, nullable=False)  # 0 to 100 percentage
    ai_plan = Column(JSON, default=dict)  # Stores the full generated plan (overview, risks, ideas, etc.)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="events")
    budgets = relationship("Budget", back_populates="event", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="event", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    vendors = relationship("Vendor", back_populates="event", cascade="all, delete-orphan")
    conversations = relationship("AIConversation", back_populates="event", cascade="all, delete-orphan")

