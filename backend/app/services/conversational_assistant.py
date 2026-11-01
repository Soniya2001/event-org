from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.conversation import AIConversation
from app.models.user import User
from app.services.gemini_service import gemini_client

def process_chat_message(
    user_message: str,
    event_id: Optional[int],
    current_user: User,
    db: Session
) -> Dict[str, Any]:
    """
    Processes chat requests with event context.
    Detects potential change intents and generates proposed modifications for user confirmation.
    """
    event = None
    event_context_str = "No specific event selected. Operating in general event planning advisory mode."
    if event_id:
        event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
        if event:
            event_context_str = f"""
            CURRENT EVENT CONTEXT:
            - Event ID: {event.id}
            - Name: {event.event_name}
            - Type: {event.event_type}
            - Date: {event.event_date}
            - Location: {event.location}
            - Guest Count: {event.guest_count}
            - Total Budget: {event.total_budget} {event.currency}
            - Status: {event.status} (Progress: {event.progress}%)
            - Preferences: {event.preferences}
            """

    # Fetch recent conversation history
    history_query = db.query(AIConversation).filter(AIConversation.user_id == current_user.id)
    if event_id:
        history_query = history_query.filter(AIConversation.event_id == event_id)
    recent_history = history_query.order_by(AIConversation.id.desc()).limit(6).all()
    history_list = [{"role": h.role, "message": h.message} for h in reversed(recent_history)]

    # Store the user message in DB
    user_record = AIConversation(
        user_id=current_user.id,
        event_id=event_id,
        role="user",
        message=user_message,
        metadata_json={}
    )
    db.add(user_record)
    db.commit()

    # System instruction
    system_prompt = f"""
    You are EventEase AI, an expert, sophisticated event planner.
    {event_context_str}
    
    Guidelines:
    1. Provide concrete, elegant, actionable guidance.
    2. All financial estimations must be clearly designated as estimates.
    3. If the user suggests changing event details (e.g. changing guest count, adjusting total budget, modifying theme, or adding a milestone), acknowledge the change, explain the implications, and state that they can confirm to apply the proposed change.
    """

    ai_reply = gemini_client.generate_chat_response(system_prompt, history_list, user_message)
    proposed_changes = []

    # Heuristic / intent detection for user confirmation proposals
    msg_lower = user_message.lower()
    
    if event:
        # Detect guest count update
        if "add" in msg_lower and "guest" in msg_lower or "increase guest" in msg_lower or "decrease guest" in msg_lower:
            import re
            numbers = re.findall(r'\b\d+\b', user_message)
            if numbers:
                val = int(numbers[0])
                new_count = event.guest_count + val if "add" in msg_lower else val
                proposed_changes.append({
                    "change_type": "update_guest_count",
                    "description": f"Update guest count from {event.guest_count} to {new_count}",
                    "payload": {"guest_count": new_count}
                })

        # Detect budget increase/decrease
        if ("budget" in msg_lower and ("increase" in msg_lower or "reduce" in msg_lower or "change" in msg_lower or "set" in msg_lower)):
            import re
            numbers = re.findall(r'\b\d+[\d,.]*\b', user_message)
            if numbers:
                clean_num = float(numbers[0].replace(",", ""))
                proposed_changes.append({
                    "change_type": "update_budget",
                    "description": f"Update total budget to {clean_num:,.2f} {event.currency}",
                    "payload": {"total_budget": clean_num}
                })

        # Detect theme suggestion
        if "theme" in msg_lower and ("south indian" in msg_lower or "royal" in msg_lower or "vintage" in msg_lower or "minimalist" in msg_lower or "boho" in msg_lower):
            detected_theme = "South Indian Traditional Heritage" if "south indian" in msg_lower else \
                             "Royal Grandeur & Gold Accents" if "royal" in msg_lower else \
                             "Modern Minimalist Chic"
            proposed_changes.append({
                "change_type": "update_theme",
                "description": f"Adopt suggested theme: '{detected_theme}'",
                "payload": {"theme": detected_theme}
            })

    if not ai_reply:
        # Smart contextual fallback replies
        if "reduce decoration" in msg_lower or "decoration cost" in msg_lower or "decor" in msg_lower:
            ai_reply = (
                f"For your {event.event_type if event else 'event'} budget, here are four high-impact ways to optimize decoration costs without compromising elegance:\n\n"
                "1. **Repurpose Statement Florals:** Move ceremony stage florals to the head/sweetheart table for the dinner reception.\n"
                "2. **Atmospheric Lighting:** Swap heavy floral ceiling arches for warm cascading fairy filaments and uplighting, creating dramatic ambiance at a fraction of floral costs.\n"
                "3. **Curated Greenery:** Incorporate rich foliage, eucalyptus, and monstera runners which are significantly more economical than imported cut blooms.\n"
                "4. **Cluster Candle Centerpieces:** Use collections of varying-height pillar candles in glass hurricane vases instead of towering flower arrangements."
            )
        elif "south indian" in msg_lower:
            ai_reply = (
                "A **South Indian Temple Heritage & Temple Grandeur** theme brings timeless splendor:\n\n"
                "- **Palette:** Deep turmeric gold, vermilion red, temple bronze, and rich Kanjeevaram emerald.\n"
                "- **Decor:** Fresh mallipoo (jasmine) and marigold strings suspended from brass Urlis filled with floating lotus buds and brass deepams.\n"
                "- **Welcome:** Traditional Nadaswaram and Thavil ensemble welcoming guests with fresh tender coconut water and filter coffee stations.\n"
                "- **Dining:** Authentic traditional Banana Leaf (Elai Saapadu) banquet featuring authentic regional specialties."
            )
        elif "food" in msg_lower and "guest" in msg_lower:
            guests = event.guest_count if event else 300
            ai_reply = (
                f"For {guests} guests, here is the professional catering formula:\n\n"
                f"- **Appetizers/Starters:** Plan for 4-5 bite-sized pieces per guest for the cocktail hour (~{guests * 5} pieces total across 3-4 varieties).\n"
                f"- **Main Course:** 250-300g protein/curry + 200g rice/breads + 150g sides per person.\n"
                f"- **Dessert:** 1.5 portions per guest (~{int(guests * 1.5)} portions).\n"
                f"- **Beverages:** 2-3 drinks per guest during the first two hours, plus dedicated hydration and coffee stations."
            )
        else:
            ai_reply = (
                f"I've reviewed the parameters for **{event.event_name if event else 'your event'}**. "
                f"Your planned budget is {event.total_budget if event else 'set'} {event.currency if event else ''} for {event.guest_count if event else 'your'} guests. "
                "How would you like to refine the schedule, optimize vendor allocations, or explore creative thematic elements today?"
            )

    # Save assistant message in DB
    asst_record = AIConversation(
        user_id=current_user.id,
        event_id=event_id,
        role="assistant",
        message=ai_reply,
        metadata_json={"proposed_changes": proposed_changes}
    )
    db.add(asst_record)
    db.commit()

    return {
        "reply": ai_reply,
        "event_id": event_id,
        "proposed_changes": proposed_changes,
        "role": "assistant"
    }

def apply_confirmed_change(event_id: int, change_type: str, payload: Dict[str, Any], current_user: User, db: Session) -> Dict[str, Any]:
    """
    Executes a user-confirmed event update, respecting rule #10.
    """
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise ValueError("Event not found or unauthorized")

    if change_type == "update_guest_count":
        event.guest_count = int(payload.get("guest_count", event.guest_count))
    elif change_type == "update_budget":
        event.total_budget = float(payload.get("total_budget", event.total_budget))
    elif change_type == "update_theme":
        prefs = dict(event.preferences or {})
        prefs["theme"] = payload.get("theme", prefs.get("theme"))
        event.preferences = prefs

    db.commit()
    db.refresh(event)
    return {"status": "success", "event_id": event.id, "updated_field": change_type}

