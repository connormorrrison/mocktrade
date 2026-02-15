import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.infrastructure.database import Base
from app.core.dependencies import get_db

# create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """Create a test client with dependency override"""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "first_name": "John",
        "last_name": "Doe", 
        "email": "john.doe@example.com",
        "username": "johndoe",
        "password": "password123"
    }

@pytest.fixture
def sample_user_update():
    """Sample user update data"""
    return {
        "first_name": "Jane",
        "last_name": "Smith"
    }

@pytest.fixture
def weak_password_user():
    """User data with weak password"""
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.weak@example.com", 
        "username": "johnweak",
        "password": "123"
    }

@pytest.fixture
def create_test_user(client, sample_user_data):
    """Create a test user and return the response"""
    response = client.post("/auth/register", json=sample_user_data)
    return response

@pytest.fixture
def authenticated_user(client, sample_user_data):
    """Create user and return auth token"""
    # register user
    client.post("/auth/register", json=sample_user_data)

    # login user
    login_response = client.post(
        "/auth/login",
        data={
            "username": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
    )
    token = login_response.json()["access_token"]
    return {
        "user_data": sample_user_data,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }