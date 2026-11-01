from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.event import Event
from app.models.vendor import Vendor
from app.models.user import User
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/vendors", tags=["Vendors"])

def get_verified_event(event_id: int, user: User, db: Session) -> Event:
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.get("/{event_id}", response_model=List[VendorResponse])
def get_event_vendors(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = get_verified_event(event_id, current_user, db)
    return db.query(Vendor).filter(Vendor.event_id == event.id).order_by(Vendor.category.asc()).all()

@router.post("/{event_id}", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(
    event_id: int,
    vendor_in: VendorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = get_verified_event(event_id, current_user, db)
    new_vendor = Vendor(
        event_id=event.id,
        name=vendor_in.name,
        category=vendor_in.category,
        contact_details=vendor_in.contact_details or {},
        estimated_quote=vendor_in.estimated_quote or 0.0,
        actual_quote=vendor_in.actual_quote or 0.0,
        booking_status=vendor_in.booking_status or "NOT_CONTACTED",
        payment_status=vendor_in.payment_status or "UNPAID",
        selection_criteria=vendor_in.selection_criteria or "",
        booking_deadline=vendor_in.booking_deadline,
        notes=vendor_in.notes or ""
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

@router.put("/{event_id}/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    event_id: int,
    vendor_id: int,
    vendor_update: VendorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = get_verified_event(event_id, current_user, db)
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.event_id == event.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    update_data = vendor_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(vendor, field, val)

    db.commit()
    db.refresh(vendor)
    return vendor

@router.delete("/{event_id}/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(
    event_id: int,
    vendor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = get_verified_event(event_id, current_user, db)
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.event_id == event.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(vendor)
    db.commit()
    return None

