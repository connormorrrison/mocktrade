# stock-trading-simulator/scripts/test_auth_profile.py
import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import asyncio

# Add the parent directory to PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.db.base import get_db
from app.models.user import User
from app.services.auth_service import AuthService

# Create test client
client = TestClient(app)

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }

@pytest.fixture(autouse=True)
def setup_and_cleanup():
    # Setup - clean before test
    db = next(get_db())
    try:
        db.query(User).filter(User.email == "test@example.com").delete()
        db.query(User).filter(User.email == "updated@example.com").delete()
        db.commit()
    except:
        db.rollback()
    
    yield  # This is where the test runs
    
    # Cleanup after test
    try:
        db.query(User).filter(User.email == "test@example.com").delete()
        db.query(User).filter(User.email == "updated@example.com").delete()
        db.commit()
    except:
        db.rollback()
    finally:
        db.close()

@pytest.mark.asyncio
async def test_user_registration(test_user_data):
    response = client.post(
        "/api/v1/auth/register",
        json=test_user_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert data["username"] == test_user_data["username"]
    assert "id" in data

@pytest.mark.asyncio
async def test_duplicate_registration(test_user_data):
    # First registration
    first_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert first_response.status_code == 200

    # Attempt duplicate registration
    second_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert second_response.status_code == 400
    assert "Email already registered" in second_response.json()["detail"]

@pytest.mark.asyncio
async def test_user_login(test_user_data):
    # First register a user
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    # Try logging in
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_invalid_login(test_user_data):
    # First register a user
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    # Try logging in with wrong password
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": "wrongpassword"
        }
    )
    assert login_response.status_code == 401
    assert "Incorrect email or password" in login_response.json()["detail"]

@pytest.mark.asyncio
async def test_get_user_profile(test_user_data):
    # Register and login
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Get profile
    profile_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_response.status_code == 200
    data = profile_response.json()
    assert data["email"] == test_user_data["email"]
    assert data["username"] == test_user_data["username"]

@pytest.mark.asyncio
async def test_update_profile(test_user_data):
    # Register and login
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Update profile
    updated_data = {
        "email": "updated@example.com",
        "username": "updateduser",
        "first_name": "Updated",
        "last_name": "User"
    }
    response = client.put(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json=updated_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == updated_data["email"]
    assert data["username"] == updated_data["username"]

@pytest.mark.asyncio
async def test_change_password(test_user_data):
    # Register and login
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Change password
    response = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": test_user_data["password"],
            "new_password": "newpass123"
        }
    )
    assert response.status_code == 200
    
    # Try logging in with new password
    new_login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": "newpass123"
        }
    )
    assert new_login_response.status_code == 200

@pytest.mark.asyncio
async def test_invalid_password_change(test_user_data):
    # Register and login
    register_response = client.post("/api/v1/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Try changing password with incorrect current password
    response = client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "wrongpassword",
            "new_password": "newpass123"
        }
    )
    assert response.status_code == 400
    assert "Current password is incorrect" in response.json()["detail"]