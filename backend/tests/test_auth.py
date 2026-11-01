import uuid

def test_register_and_login(client):
    uid = str(uuid.uuid4())[:8]
    email = f"alex_{uid}@example.com"

    # 1. Register
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Alex Taylor",
        "email": email,
        "password": "SecurePassword123!",
        "currency": "EUR"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["name"] == "Alex Taylor"

    # Duplicate register should fail
    dup_res = client.post("/api/v1/auth/register", json={
        "name": "Alex Taylor",
        "email": email,
        "password": "SecurePassword123!"
    })
    assert dup_res.status_code == 400

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Invalid login
    bad_login = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

def test_get_me(client, auth_headers):
    me_res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    user = me_res.json()
    assert "jane_" in user["email"]
    assert user["name"] == "Jane Doe"
