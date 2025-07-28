import pytest
from fastapi import status
from app.domains.auth.models import User
from app.domains.auth.services import AuthService
from app.domains.auth.schemas import UserCreate, UserUpdate, PasswordChange
from app.domains.auth.exceptions import (
    InvalidCredentialsError,
    EmailAlreadyExistsError, 
    UsernameAlreadyExistsError,
    WeakPasswordError,
    UserInactiveError
)

class TestAuthAPI:
    """Test auth API endpoints"""
    
    def test_register_success(self, client, sample_user_data):
        """Test successful user registration"""
        response = client.post("/auth/register", json=sample_user_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == sample_user_data["email"]
        assert data["username"] == sample_user_data["username"]
        assert data["first_name"] == sample_user_data["first_name"]
        assert data["last_name"] == sample_user_data["last_name"]
        assert data["cash_balance"] == 100000.0
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data

    def test_register_duplicate_email(self, client, sample_user_data):
        """Test registration with duplicate email"""
        # First registration
        client.post("/auth/register", json=sample_user_data)
        
        # Second registration with same email
        duplicate_user = sample_user_data.copy()
        duplicate_user["username"] = "different_username"
        response = client.post("/auth/register", json=duplicate_user)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.json()["detail"].lower() and "already" in response.json()["detail"].lower()

    def test_register_duplicate_username(self, client, sample_user_data):
        """Test registration with duplicate username"""
        # First registration
        client.post("/auth/register", json=sample_user_data)
        
        # Second registration with same username
        duplicate_user = sample_user_data.copy()
        duplicate_user["email"] = "different@example.com"
        response = client.post("/auth/register", json=duplicate_user)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username" in response.json()["detail"].lower() and "already" in response.json()["detail"].lower()

    def test_register_weak_password(self, client, weak_password_user):
        """Test registration with weak password"""
        response = client.post("/auth/register", json=weak_password_user)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_invalid_email(self, client, sample_user_data):
        """Test registration with invalid email format"""
        invalid_email_user = sample_user_data.copy()
        invalid_email_user["email"] = "invalid-email"
        
        response = client.post("/auth/register", json=invalid_email_user)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_success(self, client, create_test_user, sample_user_data):
        """Test successful login"""
        response = client.post(
            "/auth/login",
            data={
                "username": sample_user_data["email"],
                "password": sample_user_data["password"]
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client, create_test_user, sample_user_data):
        """Test login with invalid credentials"""
        response = client.post(
            "/auth/login",
            data={
                "username": sample_user_data["email"],
                "password": "wrong_password"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent user"""
        response = client.post(
            "/auth/login", 
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user(self, client, authenticated_user):
        """Test getting current user info"""
        response = client.get(
            "/auth/me",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == authenticated_user["user_data"]["email"]
        assert data["username"] == authenticated_user["user_data"]["username"]

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without auth"""
        response = client.get("/auth/me")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile_success(self, client, authenticated_user, sample_user_update):
        """Test successful profile update"""
        response = client.put(
            "/auth/profile",
            json=sample_user_update,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["first_name"] == sample_user_update["first_name"]
        assert data["last_name"] == sample_user_update["last_name"]

    def test_update_profile_unauthorized(self, client, sample_user_update):
        """Test profile update without auth"""
        response = client.put("/auth/profile", json=sample_user_update)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_change_password_success(self, client, authenticated_user):
        """Test successful password change"""
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "newpassword123"
        }
        
        response = client.post(
            "/auth/change-password",
            json=password_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert "successfully" in response.json()["message"].lower()

    def test_change_password_wrong_current(self, client, authenticated_user):
        """Test password change with wrong current password"""
        password_data = {
            "current_password": "wrong_password",
            "new_password": "newpassword123"
        }
        
        response = client.post(
            "/auth/change-password",
            json=password_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_weak_new(self, client, authenticated_user):
        """Test password change with weak new password"""
        password_data = {
            "current_password": authenticated_user["user_data"]["password"],
            "new_password": "123"
        }
        
        response = client.post(
            "/auth/change-password",
            json=password_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_delete_account_success(self, client, authenticated_user):
        """Test successful account deletion"""
        response = client.delete(
            "/auth/me",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert "deleted" in response.json()["message"].lower()

    def test_delete_account_unauthorized(self, client):
        """Test account deletion without auth"""
        response = client.delete("/auth/me")
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAuthService:
    """Test auth service business logic"""
    
    def test_register_user_success(self, db, sample_user_data):
        """Test successful user registration in service"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        
        user = auth_service.register_user(user_create)
        
        assert user.email == sample_user_data["email"]
        assert user.username == sample_user_data["username"]
        assert user.cash_balance == 100000.0
        assert user.is_active is True
        assert user.hashed_password != sample_user_data["password"]  # Should be hashed

    def test_register_user_weak_password(self, db):
        """Test registration with weak password in service"""
        auth_service = AuthService(db)
        # Test at service level bypassing Pydantic validation
        user_data = UserCreate(
            first_name="John",
            last_name="Doe", 
            email="john@example.com",
            username="johndoe",
            password="password123"  # Valid for Pydantic, will test service validation
        )
        
        # Override password after creation to bypass Pydantic validation
        user_data.password = "123"
        
        with pytest.raises(WeakPasswordError):
            auth_service.register_user(user_data)

    def test_authenticate_user_success(self, db, sample_user_data):
        """Test successful user authentication"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        
        # Create user first
        created_user = auth_service.register_user(user_create)
        
        # Authenticate user
        authenticated_user = auth_service.authenticate_user(
            sample_user_data["email"], 
            sample_user_data["password"]
        )
        
        assert authenticated_user.id == created_user.id
        assert authenticated_user.email == sample_user_data["email"]

    def test_authenticate_user_invalid_password(self, db, sample_user_data):
        """Test authentication with wrong password"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        
        # Create user first
        auth_service.register_user(user_create)
        
        # Try to authenticate with wrong password
        with pytest.raises(InvalidCredentialsError):
            auth_service.authenticate_user(
                sample_user_data["email"],
                "wrong_password"
            )

    def test_authenticate_nonexistent_user(self, db):
        """Test authentication of nonexistent user"""
        auth_service = AuthService(db)
        
        with pytest.raises(InvalidCredentialsError):
            auth_service.authenticate_user("nonexistent@example.com", "password123")

    def test_create_access_token(self, db, sample_user_data):
        """Test access token creation"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        user = auth_service.register_user(user_create)
        
        token = auth_service.create_access_token(user)
        
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are typically long

    def test_get_user_by_email(self, db, sample_user_data):
        """Test getting user by email"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        created_user = auth_service.register_user(user_create)
        
        retrieved_user = auth_service.get_user_by_email(sample_user_data["email"])
        
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == sample_user_data["email"]

    def test_get_user_by_email_not_found(self, db):
        """Test getting nonexistent user by email"""
        auth_service = AuthService(db)
        user = auth_service.get_user_by_email("nonexistent@example.com")
        assert user is None

    def test_update_user_profile(self, db, sample_user_data):
        """Test updating user profile"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        user = auth_service.register_user(user_create)
        
        update_data = UserUpdate(first_name="Jane", last_name="Smith")
        updated_user = auth_service.update_user_profile(user, update_data)
        
        assert updated_user.first_name == "Jane"
        assert updated_user.last_name == "Smith"
        assert updated_user.email == sample_user_data["email"]  # Unchanged

    def test_change_password_success(self, db, sample_user_data):
        """Test successful password change"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        user = auth_service.register_user(user_create)
        
        password_change = PasswordChange(
            current_password=sample_user_data["password"],
            new_password="newpassword123"
        )
        
        # Should not raise exception
        auth_service.change_password(user, password_change)
        
        # Verify new password works
        authenticated_user = auth_service.authenticate_user(
            user.email, 
            "newpassword123"
        )
        assert authenticated_user.id == user.id

    def test_change_password_wrong_current(self, db, sample_user_data):
        """Test password change with wrong current password"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        user = auth_service.register_user(user_create)
        
        password_change = PasswordChange(
            current_password="wrong_password",
            new_password="newpassword123"
        )
        
        with pytest.raises(InvalidCredentialsError):
            auth_service.change_password(user, password_change)

    def test_deactivate_user(self, db, sample_user_data):
        """Test user deactivation"""
        auth_service = AuthService(db)
        user_create = UserCreate(**sample_user_data)
        user = auth_service.register_user(user_create)
        
        deactivated_user = auth_service.deactivate_user(user)
        
        assert deactivated_user.is_active is False
        
        # Should not be able to authenticate deactivated user
        with pytest.raises(UserInactiveError):
            auth_service.authenticate_user(
                sample_user_data["email"],
                sample_user_data["password"]
            )