# app/core/exceptions.py

class BusinessLogicError(Exception):
    """Base exception for business logic errors"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ValidationError(BusinessLogicError):
    """Raised when validation fails"""
    pass

class NotFoundError(BusinessLogicError):
    """Raised when a resource is not found"""
    pass

class ConflictError(BusinessLogicError):
    """Raised when there's a conflict (e.g., duplicate resource)"""
    pass

class AuthenticationError(BusinessLogicError):
    """Raised when authentication fails"""
    pass

class AuthorizationError(BusinessLogicError):
    """Raised when authorization fails"""
    pass