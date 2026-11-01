from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.event import Event
from app.models.conversation import AIConversation
from app.models.user import User
from app.schemas.ai import (
    PlanGenerationRequest, FullEventPlanAI,
    BudgetOptimizationRequest, BudgetOptimizationResponse,
    TimelineGenRequest, TimelineGenResponse,
    RecommendationRequest, RecommendationResponse,
    ChatMessageRequest, ChatMessageResponse, ProposedEventChange
)
from app.utils.dependencies import get_current_user
from app.services.event_planner import generate_full_event_plan
from app.services.budget_optimizer import optimize_event_budget
from app.services.timeline_generator import generate_intelligent_timeline
from app.services.recommendation_engine import generate_personalized_recommendations
from app.services.conversational_assistant import process_chat_message, apply_confirmed_change

router = APIRouter(prefix="/ai", tags=["AI Services"])

def get_verified_event(event_id: int, user: User, db: Session) -> Event:
    """Helper ensuring the target event belongs strictly to the authenticated user."""
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    return event

@router.post("/generate-plan", response_model=FullEventPlanAI)
def generate_plan(
    req: PlanGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Module 1: Comprehensive Event Plan Generator.
    Synthesizes event type, budget, guest count, and cultural nuances via Gemini 2.5 Flash
    into a 6-part blueprint with 100% deterministic budget reconciliation and risk management.
    """
    event = get_verified_event(req.event_id, current_user, db)
    plan = generate_full_event_plan(event, db)
    return plan

@router.post("/optimize-budget", response_model=BudgetOptimizationResponse)
def optimize_budget(
    req: BudgetOptimizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Module 2: Smart Budget Optimizer.
    Evaluates budget elasticity across categories, proposes surgical cost-saving reductions,
    and safeguards a 5-10% contingency emergency fund without degrading guest experience.
    """
    event = get_verified_event(req.event_id, current_user, db)
    result = optimize_event_budget(event, req.target_reduction_percentage or 10.0, db)
    return result

@router.post("/generate-timeline", response_model=TimelineGenResponse)
def generate_timeline(
    req: TimelineGenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Module 3: Intelligent Timeline & Milestone Generator.
    Calculates reverse-engineered preparation schedules prioritizing high lead-time items
    (venue holds, custom attire, culinary tastings) relative to the event date.
    """
    event = get_verified_event(req.event_id, current_user, db)
    tasks = generate_intelligent_timeline(event)
    return {"event_id": event.id, "tasks": tasks}

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    req: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Module 4: Personalized Idea & Recommendation Engine.
    Delivers bespoke thematic styling, floral palettes, interactive culinary bars,
    and memorable guest touchpoints tailored to cultural traditions and headcount.
    """
    event = get_verified_event(req.event_id, current_user, db)
    ideas = generate_personalized_recommendations(event, req.category_focus)
    return {"event_id": event.id, "recommendations": ideas}

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_assistant(
    req: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Module 5: Context-Aware Conversational Planning Assistant.
    Maintains full event state in prompt context. Detects user parameter modification intents
    and responds with structured proposed changes requiring explicit user confirmation.
    """
    result = process_chat_message(
        user_message=req.message,
        event_id=req.event_id,
        current_user=current_user,
        db=db
    )
    return result

@router.post("/confirm-change")
def confirm_event_change(
    event_id: int,
    change_type: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Human-In-The-Loop Confirmation Handler.
    Applies conversational AI proposed modifications (e.g. updating budget, adjusting guest count)
    only upon explicit user review and confirmation.
    """
    try:
        res = apply_confirmed_change(event_id, change_type, payload, current_user, db)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{event_id}")
def get_chat_history(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve chronologically ordered conversation thread for a specific event.
    """
    event = get_verified_event(event_id, current_user, db)
    messages = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id,
        AIConversation.event_id == event.id
    ).order_by(AIConversation.created_at.asc()).all()
    return [{"role": m.role, "message": m.message, "created_at": m.created_at, "metadata": m.metadata_json} for m in messages]
