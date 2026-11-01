import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.services.gemini_service import gemini_client

# Ensure fast, deterministic, offline test runs without external API latency
settings.GEMINI_API_KEY = ""
gemini_client.client = None
gemini_client.api_key = ""

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def auth_headers(client):
    import uuid
    uid = str(uuid.uuid4())[:8]
    res = client.post("/api/v1/auth/register", json={
        "name": "Jane Doe",
        "email": f"jane_{uid}@example.com",
        "password": "Password123!",
        "currency": "USD"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
