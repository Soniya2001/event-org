from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    contact_details = Column(JSON, default=dict)  # phone, email, website, contact_person
    estimated_quote = Column(Float, default=0.0, nullable=False)
    actual_quote = Column(Float, default=0.0, nullable=False)
    booking_status = Column(String(50), default="NOT_CONTACTED", nullable=False)  # NOT_CONTACTED, CONTACTED, QUOTED, BOOKED, DECLINED
    payment_status = Column(String(50), default="UNPAID", nullable=False)          # UNPAID, ADVANCE_PAID, FULLY_PAID
    selection_criteria = Column(Text, default="")
    booking_deadline = Column(String(50), nullable=True)
    notes = Column(Text, default="")

    # Relationships
    event = relationship("Event", back_populates="vendors")

