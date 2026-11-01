import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(100), default="General")
    start_date = Column(String(50), nullable=True)
    due_date = Column(String(50), nullable=False, index=True)
    priority = Column(String(50), default="MEDIUM", nullable=False, index=True)  # LOW, MEDIUM, HIGH, URGENT
    status = Column(String(50), default="PENDING", nullable=False, index=True)   # PENDING, IN_PROGRESS, COMPLETED
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Composite performance indexes
    __table_args__ = (
        Index("ix_tasks_event_status", "event_id", "status"),
        Index("ix_tasks_event_due_date", "event_id", "due_date"),
        Index("ix_tasks_event_priority", "event_id", "priority"),
    )

    # Relationships
    event = relationship("Event", back_populates="tasks")
