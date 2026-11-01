def test_ai_generation_and_chat(client, auth_headers):
    # 1. Create event
    ev_payload = {
        "event_name": "Sapphire Silver Anniversary",
        "event_type": "Anniversary",
        "event_date": "2026-12-30",
        "location": "The Ritz Grand Ballroom",
        "guest_count": 120,
        "total_budget": 20000.0,
        "currency": "USD",
        "preferences": {
            "theme": "Silver & Sapphire Elegance",
            "food_preference": "Gourmet Multi-course Plated"
        }
    }
    create_res = client.post("/api/v1/events/", json=ev_payload, headers=auth_headers)
    assert create_res.status_code == 201
    ev_id = create_res.json()["id"]

    # 2. Test Plan Generation
    plan_res = client.post("/api/v1/ai/generate-plan", json={"event_id": ev_id}, headers=auth_headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert "overview" in plan
    assert "budget_breakdown" in plan
    assert "timeline" in plan
    assert "vendor_checklist" in plan
    assert "risk_management" in plan

    # Verify deterministic budget reconciliation
    total_reconciled = sum(item["estimated_cost"] for item in plan["budget_breakdown"])
    assert abs(total_reconciled - 20000.0) < 0.05

    # 3. Test Budget Optimizer
    opt_res = client.post("/api/v1/ai/optimize-budget", json={
        "event_id": ev_id,
        "target_reduction_percentage": 15.0
    }, headers=auth_headers)
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["projected_savings"] > 0
    assert opt_data["contingency_fund_allocated"] > 0

    # 4. Test Chat Assistant
    chat_res = client.post("/api/v1/ai/chat", json={
        "event_id": ev_id,
        "message": "How can I reduce my decoration costs for this anniversary?"
    }, headers=auth_headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 20

