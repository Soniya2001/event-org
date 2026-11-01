from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.budget import Budget
from app.models.task import Task
from app.models.vendor import Vendor
from app.models.expense import Expense
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token, UserProfileUpdate
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.utils.dependencies import get_current_user
from app.utils.business_logic import calculate_budget_reconciliation
from app.utils.validators import validate_password_strength, sanitize_text

router = APIRouter(prefix="/auth", tags=["Authentication"])

def seed_demo_data_if_needed(user: User, db: Session):
    existing_event = db.query(Event).filter(Event.user_id == user.id).first()
    if existing_event:
        return existing_event

    # Create rich demo event
    demo_plan = {
        "overview": {
            "concept": "An opulent Royal Rajputana celebration blending centuries-old palace architecture with contemporary luxury hospitality.",
            "theme": "Royal Rajputana Grandeur & Amber Heritage",
            "description": "Hosted across the illuminated courtyards of The Raj Palace in Jaipur with hand-carved floral mandaps, live folk ensembles, and royal banquet dining.",
            "recommended_format": "Grand Welcome with Shehnai & Dhol -> Sunset Vows at Heritage Mandap -> Royal Feast -> Sangeet & Celebration"
        },
        "budget_breakdown": [
            {"category": "Venue & Heritage Fort", "estimated_cost": 1050000.0, "percentage": 30.0, "explanation": "Exclusive 3-day hold of heritage lawns, palace suites, and banquet hall.", "cost_saving_suggestions": "Off-peak weekday rate negotiated."},
            {"category": "Royal Catering & Bar", "estimated_cost": 1120000.0, "percentage": 32.0, "explanation": "Live Awadhi & Rajasthani counters, dessert pavilion, and artisanal mocktails for 250 guests.", "cost_saving_suggestions": "Consolidated per-plate dessert courses."},
            {"category": "Floral & Palace Lighting", "estimated_cost": 490000.0, "percentage": 14.0, "explanation": "Yellow marigold strings, tuberose chandeliers, and warm amber architectural uplighting.", "cost_saving_suggestions": "Repurposed mandap florals for reception backdrop."},
            {"category": "Photography & Cinematography", "estimated_cost": 350000.0, "percentage": 10.0, "explanation": "Full 3-day drone, candid photo, and 4K cinematic trailer coverage.", "cost_saving_suggestions": "Bundled photo & video crew discount."},
            {"category": "Folk Music & Sangeet DJ", "estimated_cost": 210000.0, "percentage": 6.0, "explanation": "Traditional Manganiyar folk welcome, acoustic sitar, and top-tier sound system.", "cost_saving_suggestions": "Shared audio rig between ceremony and after-party."},
            {"category": "Emergency Contingency Fund", "estimated_cost": 175000.0, "percentage": 5.0, "explanation": "5% safety reserve allocated for unforeseen transport or weather additions.", "cost_saving_suggestions": "Protected reserve; not spent unless critical."},
            {"category": "Stationery & Welcome Hampers", "estimated_cost": 105000.0, "percentage": 3.0, "explanation": "Custom wax-sealed scrolls and artisan brass keepsake boxes with local sweets.", "cost_saving_suggestions": "Direct sourcing from local artisan cooperatives."}
        ],
        "timeline": [
            {"task": "Lock In Heritage Palace Booking & Deposit", "description": "Confirmed booking at The Raj Palace, Jaipur.", "start_date": "2026-09-01", "due_date": "2026-09-15", "priority": "URGENT", "completion_status": "COMPLETED"},
            {"task": "Tasting Session for Awadhi & Rajasthani Menu", "description": "Finalized 6-course royal menu and dietary requirements.", "start_date": "2026-10-01", "due_date": "2026-10-15", "priority": "HIGH", "completion_status": "COMPLETED"},
            {"task": "Finalize Marigold Floral Moodboard & Mandap Design", "description": "Reviewing 3D render of floating lotus and marigold mandap.", "start_date": "2026-10-20", "due_date": "2026-11-10", "priority": "HIGH", "completion_status": "IN_PROGRESS"},
            {"task": "Dispatch Royal Wax-Sealed Invitations", "description": "Track RSVP responses through the digital guest portal.", "start_date": "2026-11-01", "due_date": "2026-11-20", "priority": "MEDIUM", "completion_status": "IN_PROGRESS"},
            {"task": "Coordinate Sangeet Choreographer & Sound Rig", "description": "Rehearsals for family performances and sound equipment check.", "start_date": "2026-11-25", "due_date": "2026-12-10", "priority": "HIGH", "completion_status": "PENDING"},
            {"task": "Run-Through Walkthrough & Audio-Visual Rehearsal", "description": "Final sound checks, lighting cues, and vendor entry passes.", "start_date": "2026-12-15", "due_date": "2026-12-17", "priority": "URGENT", "completion_status": "PENDING"}
        ],
        "vendor_checklist": [
            {"category": "Venue & Banquets", "selection_criteria": "Heritage palace with capacity for 250+ guests and royal architecture.", "estimated_price_range": "₹10,00,000 - ₹12,00,000", "booking_deadline": "2026-09-15", "contact_status": "CONTACTED", "booking_status": "BOOKED"},
            {"category": "Royal Catering Services", "selection_criteria": "Specialists in Awadhi Dum & Royal Rajasthani Thali menus.", "estimated_price_range": "₹10,50,000 - ₹12,50,000", "booking_deadline": "2026-10-15", "contact_status": "CONTACTED", "booking_status": "BOOKED"},
            {"category": "Photography & Film", "selection_criteria": "Published wedding photographer with drone operator license.", "estimated_price_range": "₹3,00,000 - ₹4,00,000", "booking_deadline": "2026-10-30", "contact_status": "CONTACTED", "booking_status": "BOOKED"},
            {"category": "Floral & Stage Decor", "selection_criteria": "Heritage floral styling using fresh marigolds, roses, and brass lamps.", "estimated_price_range": "₹4,50,000 - ₹5,50,000", "booking_deadline": "2026-11-10", "contact_status": "CONTACTED", "booking_status": "QUOTED"}
        ],
        "personalized_ideas": {
            "themes": ["Royal Rajputana Heritage", "Palace of Lights & Chandeliers", "Mughal Garden Romance"],
            "decorations": ["Floating brass urlis with fresh marigolds and rose petals", "Carved wooden jharokha photobooth backdrop", "Hundreds of brass hanging deepams along the grand stairway"],
            "activities": ["Live block printing textile keepsake workshop for guests", "Royal portrait station with instant polaroid photo book", "Traditional turban tying and mehendi lounge with folk musicians"],
            "entertainment": ["Manganiyar and Langa folk musicians welcoming guests at royal arch", "Evening fusion performance with sitar, violin, and live tabla", "Grand fireworks showcase over the palace ramparts"],
            "food_arrangements": ["Authentic Dal Baati Churma and Gatte ki Sabzi live counter", "Slow-cooked Awadhi Biryani served in clay handis", "Artisan live Jalebi and Rabri dessert station"],
            "guest_experiences": ["Traditional rosewater spray and garland welcome upon arrival", "Curated local blue pottery and spiced tea gift hampers", "Dedicated concierge golf carts transporting guests across palace grounds"],
            "unique_highlights": ["Grand procession with regal vintage convertible arrival", "Illuminated nighttime drone photography of the palace courtyard"]
        },
        "risk_management": [
            {"risk_factor": "Evening Winter Chill & Temperature Drop", "severity": "MEDIUM", "impact_description": "December evenings in Jaipur can drop to 10°C, causing discomfort outdoors.", "mitigation_strategy": "Place 20 outdoor decorative brass fire pits (angithis) and provide luxury pashmina shawls."},
            {"risk_factor": "Heritage Monument Decor Restrictions", "severity": "LOW", "impact_description": "Heritage palace prohibits nails, adhesives, or structural alterations.", "mitigation_strategy": "Utilize freestanding truss arches and weighted brass bases exclusively."},
            {"risk_factor": "Last-Minute Guest Count Additions", "severity": "MEDIUM", "impact_description": "Additional extended family attendees arriving unannounced.", "mitigation_strategy": "Catering team contracted with a mandatory +10% live buffer on per-plate food prep."}
        ]
    }

    event = Event(
        user_id=user.id,
        event_name="Grand Royal Heritage Palace Wedding",
        event_type="Wedding",
        event_date="2026-12-18",
        location="The Raj Palace, Jaipur, Rajasthan",
        guest_count=250,
        total_budget=3500000.0,
        currency="INR",
        preferences={
            "theme": "Royal Rajputana Grandeur & Amber Heritage",
            "decor_style": "Cascading Marigolds, Brass Deepams & Fairy Light Canopy",
            "food_preference": "Royal Awadhi & Rajasthani Banquet",
            "indoor_outdoor": "Heritage Courtyard & Illuminated Lawn",
            "cultural_preferences": "Traditional Indian Royal Ceremony",
            "color_palette": "Deep Turmeric Gold, Emerald Green & Crimson Red"
        },
        status="Planning",
        progress=45,
        ai_plan=demo_plan
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Seed Budgets
    for b in demo_plan["budget_breakdown"]:
        b_rec = Budget(
            event_id=event.id,
            category=b["category"],
            allocated_amount=b["estimated_cost"],
            estimated_amount=b["estimated_cost"],
            actual_amount=0.0,
            percentage=b["percentage"],
            notes=b.get("explanation", ""),
            savings_tip=b.get("cost_saving_suggestions", "")
        )
        db.add(b_rec)

    # Seed Tasks
    for t in demo_plan["timeline"]:
        t_rec = Task(
            event_id=event.id,
            title=t["task"],
            description=t["description"],
            category="Planning",
            due_date=t["due_date"],
            priority=t["priority"],
            status=t["completion_status"]
        )
        db.add(t_rec)

    # Seed Vendors
    vendors_data = [
        {"name": "The Raj Palace Heritage Lawns", "category": "Venue & Banquets", "est": 1050000.0, "act": 1050000.0, "b_stat": "BOOKED", "p_stat": "FULLY_PAID", "person": "Mahaveer Singh", "phone": "+91 141 2634078", "notes": "Full palace courtyard and 20 suites booked."},
        {"name": "Royal Rasoi Banquets & Caterers", "category": "Catering Services", "est": 1120000.0, "act": 1120000.0, "b_stat": "BOOKED", "p_stat": "ADVANCE_PAID", "person": "Chef Raghuvendra", "phone": "+91 98290 12345", "notes": "Awadhi and Rajasthani live thali counters."},
        {"name": "Jaipur Wedding Chronicles Photography", "category": "Photography & Film", "est": 350000.0, "act": 350000.0, "b_stat": "BOOKED", "p_stat": "ADVANCE_PAID", "person": "Karan Mehra", "phone": "+91 98291 99887", "notes": "Candid photos, drone cinematography & 4K teaser."},
        {"name": "Mandapam Artisans & Floral Stylists", "category": "Decor & Florals", "est": 490000.0, "act": 475000.0, "b_stat": "QUOTED", "p_stat": "UNPAID", "person": "Pooja Sharma", "phone": "+91 98280 54321", "notes": "Marigold mandap and brass hanging lamps."}
    ]
    for vd in vendors_data:
        v_rec = Vendor(
            event_id=event.id,
            name=vd["name"],
            category=vd["category"],
            contact_details={"contact_person": vd["person"], "phone": vd["phone"], "email": "info@vendor.com"},
            estimated_quote=vd["est"],
            actual_quote=vd["act"],
            booking_status=vd["b_stat"],
            payment_status=vd["p_stat"],
            notes=vd["notes"]
        )
        db.add(v_rec)

    # Seed Expenses
    expenses_data = [
        {"cat": "Venue & Heritage Fort", "amt": 1050000.0, "desc": "Palace booking full settlement", "date": "2026-09-15"},
        {"cat": "Royal Catering & Bar", "amt": 400000.0, "desc": "Catering advance confirmation deposit", "date": "2026-10-15"},
        {"cat": "Photography & Cinematography", "amt": 150000.0, "desc": "Cinematography advance payment", "date": "2026-10-30"},
        {"cat": "Stationery & Welcome Hampers", "amt": 50000.0, "desc": "Advance for handcrafted brass gift hampers", "date": "2026-11-01"},
    ]
    for ed in expenses_data:
        e_rec = Expense(
            event_id=event.id,
            category=ed["cat"],
            amount=ed["amt"],
            description=ed["desc"],
            expense_date=ed["date"]
        )
        db.add(e_rec)

    db.commit()
    calculate_budget_reconciliation(event, db)
    return event

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account with enterprise password strength enforcement and XSS sanitization.
    """
    is_valid, msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    clean_name = sanitize_text(user_data.name)
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    hashed_pwd = get_password_hash(user_data.password)
    user = User(
        name=clean_name,
        email=user_data.email,
        password_hash=hashed_pwd,
        currency=user_data.currency or "USD"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.post("/demo", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """
    Instantly logs into or creates the pre-seeded luxury demo account.
    Never fails, pre-populates with rich Jaipur Royal Palace Wedding event data.
    """
    demo_email = "demo@eventease.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Soniya (Event Director)",
            email=demo_email,
            password_hash=get_password_hash("demoPassword123!"),
            currency="INR"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    seed_demo_data_if_needed(user, db)

    access_token = create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.currency is not None:
        current_user.currency = profile_data.currency
    db.commit()
    db.refresh(current_user)
    return current_user
