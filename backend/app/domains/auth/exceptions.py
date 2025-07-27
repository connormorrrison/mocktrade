# app/domains/auth/exceptions.py

from app.core.exceptions import BusinessLogicError

class AuthError(BusinessLogicError):
    """Base exception for auth domain"""
    pass

class UserNotFoundError(AuthError):
    """Raised when user is not found"""
    pass

class InvalidCredentialsError(AuthError):
    """Raised when login credentials are invalid"""
    pass

class EmailAlreadyExistsError(AuthError):
    """Raised when email is already registered"""
    pass

class UsernameAlreadyExistsError(AuthError):
    """Raised when username is already taken"""
    pass

class WeakPasswordError(AuthError):
    """Raised when password doesn't meet requirements"""
    pass

class UserInactiveError(AuthError):
    """Raised when user account is deactivated"""
    pass