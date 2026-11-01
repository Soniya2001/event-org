from app.utils.validators import validate_password_strength, sanitize_text

def test_security_headers_and_process_time(client):
    res = client.get("/health")
    assert res.status_code == 200
    headers = res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Strict-Transport-Security" in headers
    assert "X-Request-ID" in headers
    assert "X-Process-Time" in headers

def test_password_policy_validation():
    # Valid strong password
    valid, msg = validate_password_strength("RoyalWedding2026!")
    assert valid is True

    # Too short (< 8 chars)
    valid, msg = validate_password_strength("Short1!")
    assert valid is False
    assert "at least 8 characters" in msg

    # Missing uppercase
    valid, msg = validate_password_strength("lowercase123!")
    assert valid is False
    assert "uppercase" in msg

    # Missing digit
    valid, msg = validate_password_strength("NoDigitsHere!")
    assert valid is False
    assert "digit" in msg

    # Missing special character
    valid, msg = validate_password_strength("NoSpecialChar123")
    assert valid is False
    assert "special character" in msg

def test_input_sanitization():
    dirty = "<script>alert('xss')</script>Royal Jaipur Wedding<img src='x' onerror='hack()'>"
    clean = sanitize_text(dirty)
    assert "<script>" not in clean
    assert "<img" not in clean
    assert "Royal Jaipur Wedding" in clean

def test_demo_login_endpoint(client):
    res = client.post("/api/v1/auth/demo")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "demo@eventease.ai"

    # Verify that demo user has the seeded event
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    events_res = client.get("/api/v1/events/", headers=headers)
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) >= 1
    assert "Jaipur" in events[0]["location"] or "Wedding" in events[0]["event_name"]

