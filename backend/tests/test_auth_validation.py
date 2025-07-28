import pytest
from fastapi import status


class TestEnhancedValidation:
    """Test enhanced input validation for auth endpoints"""
    
    def test_register_with_whitespace_names(self, client):
        """Test registration with names containing whitespace"""
        user_data = {
            "first_name": "  John  ",  # Extra spaces
            "last_name": "  Doe  ",
            "email": "john.doe@example.com",
            "username": "johndoe",
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Names should be trimmed and title-cased
        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"

    def test_register_with_mixed_case_username(self, client):
        """Test username normalization to lowercase"""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "username": "JohnDoe123",  # Mixed case
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == status.HTTP_200_OK
        
        # Username should be normalized to lowercase
        data = response.json()
        assert data["username"] == "johndoe123"

    def test_register_invalid_name_characters(self, client):
        """Test rejection of invalid characters in names"""
        invalid_names = [
            "John123",      # Numbers
            "John@Doe",     # Special characters
            "John<script>", # HTML/script tags
            "John_Doe",     # Underscores
        ]
        
        for invalid_name in invalid_names:
            user_data = {
                "first_name": invalid_name,
                "last_name": "Doe",
                "email": f"test{invalid_name}@example.com",
                "username": f"user{invalid_name}",
                "password": "password123"
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_valid_name_characters(self, client):
        """Test acceptance of valid characters in names"""
        valid_names = [
            ("Mary-Jane", "Mary-Jane"),           # Hyphen
            ("O'Connor", "O'Connor"),             # Apostrophe  
            ("jean claude", "Jean Claude"),       # Space, should be title-cased
            ("maría", "María"),                   # Accented characters
        ]
        
        for input_name, expected_name in valid_names:
            # Clean name for username (remove accents, spaces, punctuation)
            import unicodedata
            clean_name = input_name.replace(' ', '').replace("'", '').replace('-', '').lower()
            # Remove accents from username
            clean_name = unicodedata.normalize('NFD', clean_name).encode('ascii', 'ignore').decode('ascii')
            user_data = {
                "first_name": input_name,
                "last_name": "Doe",
                "email": f"test{clean_name}@example.com",
                "username": f"user{clean_name}",
                "password": "password123"
            }
            
            response = client.post("/auth/register", json=user_data)
            if response.status_code != status.HTTP_200_OK:
                print(f"Failed for name: {input_name}")
                print(f"Response: {response.json()}")
            assert response.status_code == status.HTTP_200_OK
            
            data = response.json()
            assert data["first_name"] == expected_name

    def test_register_invalid_username_characters(self, client):
        """Test rejection of invalid username characters"""
        invalid_usernames = [
            "user@name",     # @ symbol
            "user name",     # Space
            "user-name",     # Hyphen
            "user#name",     # Hash
            ".username",     # Starting with dot
            "username.",     # Ending with dot
            "us",            # Too short (less than 3)
            "a" * 31,        # Too long (more than 30)
        ]
        
        for invalid_username in invalid_usernames:
            user_data = {
                "first_name": "John",
                "last_name": "Doe",
                "email": f"test{hash(invalid_username)}@example.com",
                "username": invalid_username,
                "password": "password123"
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_valid_username_characters(self, client):
        """Test acceptance of valid username characters"""
        valid_usernames = [
            "user123",       # Alphanumeric
            "user_name",     # Underscore
            "user.name",     # Dot (not at start/end)
            "user_123.test", # Mixed valid characters
        ]
        
        for valid_username in valid_usernames:
            user_data = {
                "first_name": "John",
                "last_name": "Doe",
                "email": f"test{valid_username}@example.com",
                "username": valid_username,
                "password": "password123"
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_200_OK

    def test_register_weak_passwords(self, client):
        """Test rejection of weak passwords"""
        weak_passwords = [
            "pass",          # Too short
            "password",      # No numbers
            "12345678",      # No letters
            "PASS1234",      # All caps (should still work but test validates)
        ]
        
        for weak_password in weak_passwords[:3]:  # Skip the last one as it's actually valid
            user_data = {
                "first_name": "John",
                "last_name": "Doe",
                "email": f"test{hash(weak_password)}@example.com",
                "username": f"user{hash(weak_password)}",
                "password": weak_password
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_strong_passwords(self, client):
        """Test acceptance of strong passwords"""
        strong_passwords = [
            "password123",   # Letters + numbers
            "MyPassword1",   # Mixed case + numbers
            "super_secure_password123", # Long with underscore
            "Test123!@#",    # With special characters
        ]
        
        for strong_password in strong_passwords:
            user_data = {
                "first_name": "John",
                "last_name": "Doe",
                "email": f"test{hash(strong_password)}@example.com",
                "username": f"user{abs(hash(strong_password))}",
                "password": strong_password
            }
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_200_OK

    def test_register_empty_fields(self, client):
        """Test rejection of empty or whitespace-only fields"""
        empty_field_tests = [
            {"first_name": "", "field": "first_name"},
            {"first_name": "   ", "field": "first_name"},
            {"last_name": "", "field": "last_name"},
            {"last_name": "   ", "field": "last_name"},
            {"username": "", "field": "username"},
            {"username": "   ", "field": "username"},
        ]
        
        for test_case in empty_field_tests:
            user_data = {
                "first_name": "John",
                "last_name": "Doe",
                "email": "test@example.com",
                "username": "testuser",
                "password": "password123"
            }
            user_data.update({k: v for k, v in test_case.items() if k != "field"})
            
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_profile_update_validation(self, client, authenticated_user):
        """Test validation during profile updates"""
        headers = authenticated_user["headers"]
        
        # Test name normalization
        update_data = {
            "first_name": "  jane  ",  # Should be trimmed and title-cased
            "last_name": "  smith  "
        }
        
        response = client.put(
            "/auth/profile",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["first_name"] == "Jane"
        assert data["last_name"] == "Smith"

    def test_profile_update_invalid_data(self, client, authenticated_user):
        """Test rejection of invalid data during profile updates"""
        headers = authenticated_user["headers"]
        
        # Test invalid name
        update_data = {
            "first_name": "Jane123"  # Numbers not allowed
        }
        
        response = client.put(
            "/auth/profile",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_field_length_limits(self, client):
        """Test field length limits"""
        # Test max length violations
        user_data = {
            "first_name": "A" * 51,  # Too long (max 50)
            "last_name": "Doe",
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Test username too long
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "test@example.com",
            "username": "a" * 31,  # Too long (max 30)
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_sql_injection_prevention(self, client):
        """Test that potential SQL injection attempts are blocked"""
        sql_injection_attempts = [
            "'; DROP TABLE users; --",
            "admin'--",
            "1' OR '1'='1",
            "<script>alert('xss')</script>",
            "{{ 7*7 }}",  # Template injection
        ]
        
        for injection_attempt in sql_injection_attempts:
            user_data = {
                "first_name": injection_attempt,
                "last_name": "Doe",
                "email": "test@example.com",
                "username": "testuser123",
                "password": "password123"
            }
            
            response = client.post("/auth/register", json=user_data)
            # Should be rejected due to invalid characters
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY