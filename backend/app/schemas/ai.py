from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# --- Section A: Overview ---
class EventOverviewAI(BaseModel):
    concept: str
    theme: str
    description: str
    recommended_format: str

# --- Section B: Budget Item ---
class BudgetItemAI(BaseModel):
    category: str
    estimated_cost: float
    percentage: float
    explanation: str
    cost_saving_suggestions: str

# --- Section C: Timeline Task ---
class TimelineTaskAI(BaseModel):
    task: str
    description: str
    start_date: str
    due_date: str
    priority: str  # LOW, MEDIUM, HIGH, URGENT
    completion_status: str = "PENDING"

# --- Section D: Vendor Requirement ---
class VendorRequirementAI(BaseModel):
    category: str
    selection_criteria: str
    estimated_price_range: str
    booking_deadline: str
    contact_status: str = "NOT_CONTACTED"
    booking_status: str = "PENDING"

# --- Section E: Personalized Ideas ---
class PersonalizedIdeasAI(BaseModel):
    themes: List[str]
    decorations: List[str]
    activities: List[str]
    entertainment: List[str]
    food_arrangements: List[str]
    guest_experiences: List[str]
    unique_highlights: List[str]

# --- Section F: Risk Item ---
class RiskItemAI(BaseModel):
    risk_factor: str
    severity: str  # LOW, MEDIUM, HIGH
    impact_description: str
    mitigation_strategy: str

# --- Full Master Plan ---
class FullEventPlanAI(BaseModel):
    overview: EventOverviewAI
    budget_breakdown: List[BudgetItemAI]
    timeline: List[TimelineTaskAI]
    vendor_checklist: List[VendorRequirementAI]
    personalized_ideas: PersonalizedIdeasAI
    risk_management: List[RiskItemAI]

# Request & Response wrappers
class PlanGenerationRequest(BaseModel):
    event_id: int

class BudgetOptimizationRequest(BaseModel):
    event_id: int
    target_reduction_percentage: Optional[float] = 10.0
    priority_categories: Optional[List[str]] = None

class BudgetOptimizationCategory(BaseModel):
    category: str
    current_allocated: float
    recommended_allocated: float
    savings_amount: float
    rationale: str
    specific_actionable_tips: List[str]

class BudgetOptimizationResponse(BaseModel):
    original_total: float
    optimized_total: float
    projected_savings: float
    contingency_fund_allocated: float
    category_recommendations: List[BudgetOptimizationCategory]
    overall_strategy: str

class TimelineGenRequest(BaseModel):
    event_id: int

class TimelineGenResponse(BaseModel):
    event_id: int
    tasks: List[TimelineTaskAI]

class RecommendationRequest(BaseModel):
    event_id: int
    category_focus: Optional[str] = None  # e.g., "decor", "activities", "food"

class RecommendationResponse(BaseModel):
    event_id: int
    recommendations: PersonalizedIdeasAI

class ChatMessageRequest(BaseModel):
    event_id: Optional[int] = None
    message: str

class ProposedEventChange(BaseModel):
    change_type: str  # e.g., "update_budget", "add_task", "adjust_guest_count", "update_theme"
    description: str
    payload: Dict[str, Any]

class ChatMessageResponse(BaseModel):
    reply: str
    event_id: Optional[int] = None
    proposed_changes: Optional[List[ProposedEventChange]] = None
    role: str = "assistant"

