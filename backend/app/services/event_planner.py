import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.budget import Budget
from app.models.task import Task
from app.models.vendor import Vendor
from app.services.gemini_service import gemini_client
from app.utils.business_logic import sanitize_and_reconcile_ai_budget, calculate_budget_reconciliation, recalculate_event_progress

def _generate_fallback_plan(event: Event) -> Dict[str, Any]:
    """
    Intelligent domain-specific fallback generator when Gemini API key is not supplied.
    Produces rich, realistic, tailored data for any event type, culture, and scale.
    """
    ev_type = (event.event_type or "Celebration").title()
    currency = event.currency or "USD"
    budget = float(event.total_budget) if event.total_budget > 0 else 10000.0
    guests = event.guest_count or 100
    location = event.location or "Grand Venue"
    prefs = event.preferences or {}
    theme = prefs.get("theme", f"Elegant {ev_type}")
    decor = prefs.get("decor_style", "Modern Floral & Ambient Lighting")
    colors = prefs.get("color_palette", "Lavender, Soft Gold, and Pearl White")
    food = prefs.get("food_preference", "Multi-cuisine Buffet")

    # Categories breakdown percentages
    category_weights = {
        "Venue & Reception": 0.28,
        "Catering & Drinks": 0.32,
        "Decor & Floral Styling": 0.14,
        "Photography & Videography": 0.10,
        "Entertainment & Audio": 0.06,
        "Invitations & Stationery": 0.02,
        "Transportation & Logistics": 0.03,
        "Emergency Contingency Fund": 0.05,
    }

    raw_budget_items = []
    for cat, weight in category_weights.items():
        cost = round(budget * weight, 2)
        tip = "Reserve at least 3-4 months in advance for early bird pricing." if "Venue" in cat else \
              "Opt for seasonal farm-to-table menus to reduce per-plate expenses." if "Catering" in cat else \
              "Consider reusable fabric drapes and LED uplighting over single-use floral walls." if "Decor" in cat else \
              "Book combined photo+video packages to bundle travel and crew discounts." if "Photography" in cat else \
              "A 5% safety buffer safeguards against last-minute headcount variations."
        raw_budget_items.append({
            "category": cat,
            "estimated_cost": cost,
            "percentage": round(weight * 100, 1),
            "explanation": f"Allocated for {guests} guests at {location} under the '{theme}' style.",
            "cost_saving_suggestions": tip
        })

    # Timeline calculations relative to event date
    try:
        ev_date = datetime.date.fromisoformat(event.event_date)
    except Exception:
        ev_date = datetime.date.today() + datetime.timedelta(days=90)

    timeline_items = [
        {
            "task": f"Finalize {ev_type} Venue Contract & Deposit",
            "description": f"Secure location in {location} with required capacity for {guests} attendees.",
            "start_date": str(ev_date - datetime.timedelta(days=75)),
            "due_date": str(ev_date - datetime.timedelta(days=60)),
            "priority": "URGENT",
            "completion_status": "PENDING"
        },
        {
            "task": "Approve Thematic Decor & Palette Concepts",
            "description": f"Review design moodboards highlighting {decor} and {colors}.",
            "start_date": str(ev_date - datetime.timedelta(days=60)),
            "due_date": str(ev_date - datetime.timedelta(days=45)),
            "priority": "HIGH",
            "completion_status": "PENDING"
        },
        {
            "task": "Catering Tasting & Menu Finalization",
            "description": f"Sample {food} menu courses and finalize dietary accommodations.",
            "start_date": str(ev_date - datetime.timedelta(days=45)),
            "due_date": str(ev_date - datetime.timedelta(days=30)),
            "priority": "HIGH",
            "completion_status": "PENDING"
        },
        {
            "task": "Send Invitations & Launch RSVP Portal",
            "description": f"Distribute digital and printed invitations to all {guests} guests.",
            "start_date": str(ev_date - datetime.timedelta(days=40)),
            "due_date": str(ev_date - datetime.timedelta(days=25)),
            "priority": "MEDIUM",
            "completion_status": "PENDING"
        },
        {
            "task": "Finalize Run-of-Show & Audio-Visual Rehearsal",
            "description": "Coordinate speeches, grand entrances, entertainment segments, and technical cues.",
            "start_date": str(ev_date - datetime.timedelta(days=14)),
            "due_date": str(ev_date - datetime.timedelta(days=3)),
            "priority": "URGENT",
            "completion_status": "PENDING"
        }
    ]

    # Vendor items
    vendor_items = [
        {
            "category": "Venue & Banquets",
            "selection_criteria": f"Capacity for {guests}+ guests, climate control, parking facilities.",
            "estimated_price_range": f"{currency} {round(budget*0.25, 0):,.0f} - {round(budget*0.30, 0):,.0f}",
            "booking_deadline": str(ev_date - datetime.timedelta(days=60)),
            "contact_status": "NOT_CONTACTED",
            "booking_status": "PENDING"
        },
        {
            "category": "Catering Services",
            "selection_criteria": f"Experience with {food}, live food stations, licensed bar service.",
            "estimated_price_range": f"{currency} {round(budget*0.28, 0):,.0f} - {round(budget*0.35, 0):,.0f}",
            "booking_deadline": str(ev_date - datetime.timedelta(days=45)),
            "contact_status": "NOT_CONTACTED",
            "booking_status": "PENDING"
        },
        {
            "category": "Decor & Florals",
            "selection_criteria": f"Portfolio showcasing {decor}, custom centerpiece construction.",
            "estimated_price_range": f"{currency} {round(budget*0.12, 0):,.0f} - {round(budget*0.16, 0):,.0f}",
            "booking_deadline": str(ev_date - datetime.timedelta(days=40)),
            "contact_status": "NOT_CONTACTED",
            "booking_status": "PENDING"
        },
        {
            "category": "Photography & Film",
            "selection_criteria": "Documentary-style candids, drone coverage, 48-hour teaser delivery.",
            "estimated_price_range": f"{currency} {round(budget*0.08, 0):,.0f} - {round(budget*0.12, 0):,.0f}",
            "booking_deadline": str(ev_date - datetime.timedelta(days=50)),
            "contact_status": "NOT_CONTACTED",
            "booking_status": "PENDING"
        }
    ]

    personalized_ideas = {
        "themes": [
            f"Imperial {theme} Gala",
            f"Modern Minimalist {ev_type} with Lavender Accents",
            "Sunset Garden Romance with Fairy Lights"
        ],
        "decorations": [
            f"Cascading floral archway in {colors}",
            "Suspended geometric lanterns with warm Edison bulbs",
            "Monogrammed entrance mirrored welcome board",
            "Custom textured table runners with brass candelabras"
        ],
        "activities": [
            "Interactive digital guestbook with instant polaroid station",
            "Personalized signature cocktail and mocktail mixology bar",
            "Custom trivia and milestone video projection",
            "Live acoustic saxophone or violin performance during cocktail hour"
        ],
        "entertainment": [
            "Curated live ensemble transitioning into an ambient evening DJ set",
            "Interactive crowd icebreakers designed for friends and family"
        ],
        "food_arrangements": [
            f"Artisan charcuterie and grazing table matching {food}",
            "Interactive chef-attended live carving or saute station",
            "Midnight sweet treat bar featuring lavender-infused macarons and warm dessert shooters"
        ],
        "guest_experiences": [
            "Custom branded fragrance or seed packet keepsakes",
            "Dedicated lounge pod with plush velvet sofas for intimate conversations",
            "Convenient valet check-in and welcome champagne upon arrival"
        ],
        "unique_highlights": [
            f"Personalized celebratory toast commemorating the special milestone",
            "Drone capture of the collective group celebration"
        ]
    }

    risk_management = [
        {
            "risk_factor": "Inclement Weather & Outdoor Elements",
            "severity": "HIGH" if "outdoor" in prefs.get("indoor_outdoor", "").lower() else "MEDIUM",
            "impact_description": "Rain, wind, or excessive heat could disrupt outdoor seating and electrical decor.",
            "mitigation_strategy": "Contract waterproof Marquee canopy provisions and secure an indoor backup salon on the venue agreement."
        },
        {
            "risk_factor": "Vendor Late Arrival or Short Notice Cancellation",
            "severity": "MEDIUM",
            "impact_description": "Key entertainment, floral, or food services delayed on event day.",
            "mitigation_strategy": "Institute signed vendor SLA contracts requiring 2-hour pre-event staging and a designated backup contact list."
        },
        {
            "risk_factor": "Unexpected Headcount Variations & Dietary Surprises",
            "severity": "MEDIUM",
            "impact_description": "Additional walk-in guests or unnotified food allergies causing kitchen delays.",
            "mitigation_strategy": "Establish a +10% catering buffer with the kitchen manager and collect dietary preferences on the digital RSVP portal."
        },
        {
            "risk_factor": "Budget Slippage from Incidental Add-ons",
            "severity": "LOW",
            "impact_description": "Cumulative micro-expenses (tips, overtime, delivery fees) exceeding budget.",
            "mitigation_strategy": f"The dedicated {currency} {round(budget*0.05, 0):,.0f} contingency fund absorbs unforeseen logistical items."
        }
    ]

    return {
        "overview": {
            "concept": f"A breathtaking {ev_type} curated for {guests} guests in {location}.",
            "theme": theme,
            "description": f"Designed around {decor} with a color scheme of {colors}. Balances high hospitality standards with seamless coordination.",
            "recommended_format": f"Welcome Reception -> Interactive Social Hour -> Main Program & Feast -> Celebration & Farewell"
        },
        "budget_breakdown": raw_budget_items,
        "timeline": timeline_items,
        "vendor_checklist": vendor_items,
        "personalized_ideas": personalized_ideas,
        "risk_management": risk_management
    }

def generate_full_event_plan(event: Event, db: Session) -> Dict[str, Any]:
    """
    Main service method: prompts Gemini for structured JSON plan.
    Enforces deterministic budget reconciliation and persists generated components to the database.
    """
    prefs = event.preferences or {}
    prompt = f"""
    You are an elite, world-class event planner. Generate a comprehensive, professional, production-ready event plan in JSON.
    
    EVENT DETAILS:
    - Event Name: {event.event_name}
    - Type: {event.event_type}
    - Date: {event.event_date}
    - Location: {event.location}
    - Guest Count: {event.guest_count}
    - Total Budget: {event.total_budget} {event.currency}
    - Preferences:
      * Theme: {prefs.get('theme', 'Not specified')}
      * Decor: {prefs.get('decor_style', 'Not specified')}
      * Colors: {prefs.get('color_palette', 'Not specified')}
      * Food: {prefs.get('food_preference', 'Not specified')}
      * Setting: {prefs.get('indoor_outdoor', 'Not specified')}
      * Cultural Elements: {prefs.get('cultural_preferences', 'Not specified')}
      * Special Requests: {prefs.get('special_activities', 'Not specified')}
      * Dietary: {prefs.get('dietary_restrictions', 'None')}

    SCHEMA REQUIRED (Return valid JSON with exactly these keys):
    {{
      "overview": {{
        "concept": "...",
        "theme": "...",
        "description": "...",
        "recommended_format": "..."
      }},
      "budget_breakdown": [
        {{
          "category": "...",
          "estimated_cost": 0.0,
          "percentage": 0.0,
          "explanation": "...",
          "cost_saving_suggestions": "..."
        }}
      ],
      "timeline": [
        {{
          "task": "...",
          "description": "...",
          "start_date": "YYYY-MM-DD",
          "due_date": "YYYY-MM-DD",
          "priority": "LOW | MEDIUM | HIGH | URGENT",
          "completion_status": "PENDING"
        }}
      ],
      "vendor_checklist": [
        {{
          "category": "...",
          "selection_criteria": "...",
          "estimated_price_range": "...",
          "booking_deadline": "YYYY-MM-DD",
          "contact_status": "NOT_CONTACTED",
          "booking_status": "PENDING"
        }}
      ],
      "personalized_ideas": {{
        "themes": ["..."],
        "decorations": ["..."],
        "activities": ["..."],
        "entertainment": ["..."],
        "food_arrangements": ["..."],
        "guest_experiences": ["..."],
        "unique_highlights": ["..."]
      }},
      "risk_management": [
        {{
          "risk_factor": "...",
          "severity": "LOW | MEDIUM | HIGH",
          "impact_description": "...",
          "mitigation_strategy": "..."
        }}
      ]
    }}
    """

    system_inst = "You are EventEase AI, a hyper-detailed, luxury and practical event management intelligence. Return only pure JSON conforming to the requested schema."
    ai_result = gemini_client.generate_structured_json(prompt, system_instruction=system_inst)
    
    if not ai_result or not isinstance(ai_result, dict) or "overview" not in ai_result:
        ai_result = _generate_fallback_plan(event)

    # Deterministic budget reconciliation: guarantee exact sum equals event.total_budget
    reconciled_budget = sanitize_and_reconcile_ai_budget(
        ai_result.get("budget_breakdown", []),
        event.total_budget
    )
    ai_result["budget_breakdown"] = reconciled_budget

    # Persist the full AI plan in the event model
    event.ai_plan = ai_result
    event.status = "Planning"

    # Save Budget records in database if none exist yet
    existing_budgets = db.query(Budget).filter(Budget.event_id == event.id).all()
    if not existing_budgets:
        for b_item in reconciled_budget:
            b_rec = Budget(
                event_id=event.id,
                category=b_item["category"],
                allocated_amount=b_item["estimated_cost"],
                estimated_amount=b_item["estimated_cost"],
                actual_amount=0.0,
                percentage=b_item["percentage"],
                notes=b_item.get("explanation", ""),
                savings_tip=b_item.get("cost_saving_suggestions", "")
            )
            db.add(b_rec)

    # Save Task records in database if none exist yet
    existing_tasks = db.query(Task).filter(Task.event_id == event.id).all()
    if not existing_tasks:
        for t_item in ai_result.get("timeline", []):
            t_rec = Task(
                event_id=event.id,
                title=t_item["task"],
                description=t_item.get("description", ""),
                category="Planning",
                start_date=t_item.get("start_date"),
                due_date=t_item.get("due_date", event.event_date),
                priority=t_item.get("priority", "MEDIUM"),
                status="PENDING"
            )
            db.add(t_rec)

    # Save Vendor records in database if none exist yet
    existing_vendors = db.query(Vendor).filter(Vendor.event_id == event.id).all()
    if not existing_vendors:
        for v_item in ai_result.get("vendor_checklist", []):
            v_rec = Vendor(
                event_id=event.id,
                name=f"Recommended {v_item['category']}",
                category=v_item["category"],
                contact_details={"website": "", "phone": "", "email": ""},
                estimated_quote=0.0,
                actual_quote=0.0,
                booking_status="NOT_CONTACTED",
                payment_status="UNPAID",
                selection_criteria=v_item.get("selection_criteria", ""),
                booking_deadline=v_item.get("booking_deadline"),
                notes=f"Price Guide: {v_item.get('estimated_price_range', '')}"
            )
            db.add(v_rec)

    db.commit()
    db.refresh(event)
    calculate_budget_reconciliation(event, db)
    recalculate_event_progress(event.id, db)

    return ai_result

