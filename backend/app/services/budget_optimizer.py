from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.budget import Budget
from app.services.gemini_service import gemini_client

def optimize_event_budget(event: Event, target_reduction_pct: float, db: Session) -> Dict[str, Any]:
    """
    Analyzes current category allocations, detects disproportionate or heavy line items,
    and applies an intelligent optimization formula that preserves contingency funds while
    producing actionable savings tips.
    """
    budgets = db.query(Budget).filter(Budget.event_id == event.id).all()
    if not budgets:
        # Fallback to total budget
        total = float(event.total_budget)
        budgets_data = [
            {"category": "Venue & Banquets", "allocated": total * 0.30},
            {"category": "Catering & Bar", "allocated": total * 0.35},
            {"category": "Decor & Styling", "allocated": total * 0.15},
            {"category": "Photography & Video", "allocated": total * 0.10},
            {"category": "Entertainment", "allocated": total * 0.05},
            {"category": "Contingency Fund", "allocated": total * 0.05}
        ]
    else:
        budgets_data = [{"category": b.category, "allocated": b.allocated_amount} for b in budgets]

    original_total = sum(b["allocated"] for b in budgets_data)
    reduction_factor = max(0.01, min(target_reduction_pct / 100.0, 0.40))  # Max 40% reduction

    recommendations = []
    total_savings = 0.0

    # Categorize and trim primarily high-flexibility categories (Decor, Entertainment, Catering tweaks)
    # while protecting essentials and contingency
    for item in budgets_data:
        cat = item["category"]
        curr = item["allocated"]
        is_contingency = "contingency" in cat.lower() or "emergency" in cat.lower()
        is_venue = "venue" in cat.lower()

        if is_contingency:
            # Keep or slightly boost contingency
            rec_amt = curr
            saving = 0.0
            rationale = "Contingency is preserved untouched to guarantee resilience against unexpected expenses."
            tips = ["Do not allocate contingency to discretionary aesthetic upgrades."]
        elif is_venue:
            # Venue contracts are less elastic
            trim = curr * (reduction_factor * 0.4)
            rec_amt = round(curr - trim, 2)
            saving = round(trim, 2)
            rationale = "Venue base rates have modest elasticity through weekday or off-peak slot negotiations."
            tips = [
                "Inquire about non-peak booking discounts or morning-to-afternoon rental rates.",
                "Negotiate complimentary access for vendor setup 3 hours prior without overtime fees."
            ]
        elif "decor" in cat.lower() or "styling" in cat.lower():
            # High elasticity
            trim = curr * (reduction_factor * 1.5)
            rec_amt = round(curr - trim, 2)
            saving = round(trim, 2)
            rationale = "Decor allows significant savings through intelligent reuse and ambient lighting over heavy floral installations."
            tips = [
                "Repurpose ceremony arch florals as the sweetheart table backdrop for the reception.",
                "Leverage warm LED fairy lights and uplighting instead of full ceiling draped floral canopies."
            ]
        elif "catering" in cat.lower() or "food" in cat.lower():
            trim = curr * (reduction_factor * 1.1)
            rec_amt = round(curr - trim, 2)
            saving = round(trim, 2)
            rationale = "Menu engineering and course consolidation dramatically reduce food waste and per-plate surcharge."
            tips = [
                "Switch from dual-protein plated service to a curated high-end buffet with live carving stations.",
                "Provide signature cocktails during cocktail hour rather than a completely open top-shelf liquor bar."
            ]
        else:
            trim = curr * reduction_factor
            rec_amt = round(curr - trim, 2)
            saving = round(trim, 2)
            rationale = "Standard market optimization through bundled vendor procurement."
            tips = ["Seek package bundles combining photography and videography."]

        total_savings += saving
        recommendations.append({
            "category": cat,
            "current_allocated": round(curr, 2),
            "recommended_allocated": round(rec_amt, 2),
            "savings_amount": round(saving, 2),
            "rationale": rationale,
            "specific_actionable_tips": tips
        })

    optimized_total = round(original_total - total_savings, 2)
    contingency_allocated = next((r["recommended_allocated"] for r in recommendations if "contingency" in r["category"].lower()), round(original_total * 0.05, 2))

    return {
        "original_total": round(original_total, 2),
        "optimized_total": optimized_total,
        "projected_savings": round(total_savings, 2),
        "contingency_fund_allocated": contingency_allocated,
        "category_recommendations": recommendations,
        "overall_strategy": f"Targeted a {target_reduction_pct}% reduction by curbing high-variance items (Decor, Catering, Production) while fully safeguarding core logistical requirements and safety contingency."
    }

