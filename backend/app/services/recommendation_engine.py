from typing import Dict, Any, List, Optional
from app.models.event import Event
from app.services.gemini_service import gemini_client

def generate_personalized_recommendations(event: Event, category_focus: Optional[str] = None) -> Dict[str, Any]:
    """
    Curates custom concepts for theme, styling, culinary choices, entertainment,
    and unforgettable guest experiences based on event parameters and cultural nuances.
    """
    prefs = event.preferences or {}
    prompt = f"""
    You are an expert creative event director. Generate bespoke creative recommendations for:
    - Event: {event.event_name}
    - Type: {event.event_type}
    - Budget: {event.total_budget} {event.currency}
    - Guests: {event.guest_count}
    - Location: {event.location}
    - Theme/Style: {prefs.get('theme', 'Not specified')}
    - Cultural Context: {prefs.get('cultural_preferences', 'Modern')}
    - Focus Category: {category_focus or 'All categories'}

    Return JSON:
    {{
      "themes": ["..."],
      "decorations": ["..."],
      "activities": ["..."],
      "entertainment": ["..."],
      "food_arrangements": ["..."],
      "guest_experiences": ["..."],
      "unique_highlights": ["..."]
    }}
    """
    ai_data = gemini_client.generate_structured_json(prompt)
    if ai_data and isinstance(ai_data, dict) and "themes" in ai_data:
        return ai_data

    # Intelligent fallback
    ev_type = event.event_type or "Celebration"
    cult = prefs.get("cultural_preferences", "Modern Contemporary")
    return {
        "themes": [
            f"Starlit Twilight {ev_type} ({cult} Fusion)",
            "Chic Botanical Conservatory with Warm Brass Accents",
            "Opulent Heritage Royal Courtyard with Ambient Draped Velvets"
        ],
        "decorations": [
            "Suspended cascading foliage hoops with dimmable amber fairy filaments",
            "Custom acrylic seating chart with gold foil calligraphy",
            "Scented botanical entryway featuring fresh jasmine and eucalyptus diffusers",
            "Velvet lounge vignettes with vintage glass coffee tables"
        ],
        "activities": [
            "Interactive audio guestbook where attendees leave voicemail memories on a vintage rotary phone",
            "Custom signature drink bar with his/her mocktails and cocktails",
            "Live watercolor caricature or fashion illustrator capturing guests on custom stationery",
            "Milestone memory gallery timeline wall"
        ],
        "entertainment": [
            "Acoustic cello & violin duo for guest arrival, transitioning to a brass funk collective",
            "Surprise choreographed tribute or ambient flash lighting showcase"
        ],
        "food_arrangements": [
            "Abundant artisan grazing tables with cured delicacies, seasonal fruits, and gourmet crackers",
            "Interactive liquid nitrogen dessert bar or flaming crepe station",
            "Late-night gourmet comfort food sliders and artisan mini-tacos passed on heated trays"
        ],
        "guest_experiences": [
            "Curated welcome gift boxes with personalized thank-you note and local delicacies",
            "Comfort amenity baskets in restrooms (mints, stain remover, cooling mist)",
            "Express digital photobooth sending instant GIFs and high-res portraits to guests' phones"
        ],
        "unique_highlights": [
            "Synchronized sparkler or cold-pyrotechnic grand farewell walkway",
            "Personalized keepsake celebration coins or wax-sealed message scrolls"
        ]
    }

