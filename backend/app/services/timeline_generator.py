import datetime
from typing import List, Dict, Any
from app.models.event import Event
from app.services.gemini_service import gemini_client

def generate_intelligent_timeline(event: Event) -> List[Dict[str, Any]]:
    """
    Computes a lead-time prioritized schedule of planning milestones working backward
    from the scheduled event date.
    """
    try:
        ev_date = datetime.date.fromisoformat(event.event_date)
    except Exception:
        ev_date = datetime.date.today() + datetime.timedelta(days=90)

    prompt = f"""
    Generate an actionable, chronological task timeline for:
    Event: {event.event_name}
    Type: {event.event_type}
    Date: {event.event_date}
    Guests: {event.guest_count}
    Location: {event.location}

    Output JSON array of tasks:
    [
      {{
        "task": "Task title",
        "description": "Clear actionable description",
        "start_date": "YYYY-MM-DD",
        "due_date": "YYYY-MM-DD",
        "priority": "LOW | MEDIUM | HIGH | URGENT",
        "completion_status": "PENDING"
      }}
    ]
    Order by start_date ascending. Lead times should be realistic relative to {event.event_date}.
    """

    ai_data = gemini_client.generate_structured_json(prompt)
    if ai_data and isinstance(ai_data, list):
        return ai_data

    # Intelligent fallback relative to ev_date
    return [
        {
            "task": "Lock In Primary Event Venue & Secure Security Bond",
            "description": f"Confirm date hold and capacity for {event.guest_count} guests at {event.location}.",
            "start_date": str(ev_date - datetime.timedelta(days=90)),
            "due_date": str(ev_date - datetime.timedelta(days=70)),
            "priority": "URGENT",
            "completion_status": "PENDING"
        },
        {
            "task": "Procure Lead Entertainment & DJ / Sound Engineer",
            "description": "Sign contracts and provide acoustics requirements and desired setlist guidelines.",
            "start_date": str(ev_date - datetime.timedelta(days=65)),
            "due_date": str(ev_date - datetime.timedelta(days=50)),
            "priority": "HIGH",
            "completion_status": "PENDING"
        },
        {
            "task": "Taste-Test Catering & Lock Menu Selection",
            "description": "Select appetizers, main courses, desserts, and specify dietary accommodations.",
            "start_date": str(ev_date - datetime.timedelta(days=50)),
            "due_date": str(ev_date - datetime.timedelta(days=35)),
            "priority": "HIGH",
            "completion_status": "PENDING"
        },
        {
            "task": "Finalize Decor Moodboard, Florals & Table Centerpieces",
            "description": "Review prototypes with floral designer and confirm delivery timeframes.",
            "start_date": str(ev_date - datetime.timedelta(days=35)),
            "due_date": str(ev_date - datetime.timedelta(days=20)),
            "priority": "MEDIUM",
            "completion_status": "PENDING"
        },
        {
            "task": "RSVP Cut-off & Seating Chart Arrangement",
            "description": "Compile final attendee roster and assign seating arrangement tables.",
            "start_date": str(ev_date - datetime.timedelta(days=20)),
            "due_date": str(ev_date - datetime.timedelta(days=10)),
            "priority": "HIGH",
            "completion_status": "PENDING"
        },
        {
            "task": "Run-Through Walkthrough & Audio-Visual Rehearsal",
            "description": "Test stage lighting, sound microphones, slideshow projections, and speech cues.",
            "start_date": str(ev_date - datetime.timedelta(days=7)),
            "due_date": str(ev_date - datetime.timedelta(days=1)),
            "priority": "URGENT",
            "completion_status": "PENDING"
        }
    ]

