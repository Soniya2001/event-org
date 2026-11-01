def test_event_lifecycle_and_isolation(client, auth_headers):
    # 1. Create event
    ev_payload = {
        "event_name": "Royal Emerald Wedding",
        "event_type": "Wedding",
        "event_date": "2026-12-15",
        "location": "Grand Palace, Jaipur",
        "guest_count": 250,
        "total_budget": 50000.0,
        "currency": "USD",
        "preferences": {
            "theme": "Royal Heritage",
            "color_palette": "Emerald & Gold"
        }
    }
    create_res = client.post("/api/v1/events/", json=ev_payload, headers=auth_headers)
    assert create_res.status_code == 201
    event = create_res.json()
    assert event["event_name"] == "Royal Emerald Wedding"
    assert event["total_budget"] == 50000.0
    ev_id = event["id"]

    # 2. Get event
    get_res = client.get(f"/api/v1/events/{ev_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["guest_count"] == 250

    # 3. Add budget category
    b_res = client.post(f"/api/v1/budgets/{ev_id}", json={
        "category": "Catering",
        "allocated_amount": 15000.0
    }, headers=auth_headers)
    assert b_res.status_code == 201
    assert b_res.json()["percentage"] == 30.0

    # 4. Add expense
    exp_res = client.post(f"/api/v1/expenses/{ev_id}", json={
        "category": "Catering",
        "amount": 4500.0,
        "description": "Advance tasting deposit",
        "expense_date": "2026-11-05"
    }, headers=auth_headers)
    assert exp_res.status_code == 201

    # 5. Check budget reconciliation
    recon_res = client.get(f"/api/v1/budgets/{ev_id}", headers=auth_headers)
    assert recon_res.status_code == 200
    recon = recon_res.json()
    assert recon["total_actual"] == 4500.0
    assert recon["remaining_balance"] == 45500.0
    assert recon["is_over_budget"] is False

    # 6. Test task completion progress
    t_res = client.post(f"/api/v1/tasks/{ev_id}", json={
        "title": "Book Venue",
        "due_date": "2026-11-20",
        "priority": "URGENT"
    }, headers=auth_headers)
    assert t_res.status_code == 201
    task_id = t_res.json()["id"]

    # Mark task completed
    up_task = client.put(f"/api/v1/tasks/{ev_id}/{task_id}", json={
        "status": "COMPLETED"
    }, headers=auth_headers)
    assert up_task.status_code == 200

    # Check updated event progress
    ev_check = client.get(f"/api/v1/events/{ev_id}", headers=auth_headers)
    assert ev_check.json()["progress"] == 100

