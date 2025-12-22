from src.core.domain.exceptions import NotAuthenticated, AlreadyExists, NotFound, BadRequest


class ErrorCode:
    AUTHENTICATION_REQUIRED = "Authentication required"
    AUTHORIZATION_FAILED = "Authorization failed. User has no access"
    INVALID_TOKEN = "Invalid token"
    INVALID_CREDENTIALS = "Invalid email or password"
    EMAIL_TAKEN = "Email is already taken"
    REFRESH_TOKEN_NOT_VALID = "Refresh token is not valid"
    REFRESH_TOKEN_REQUIRED = "Refresh token is required either in the body or cookie"
    NOT_FOUND = "User not found"


class InvalidCredentials(NotAuthenticated):
    detail = ErrorCode.INVALID_CREDENTIALS


class UserAlreadyExists(AlreadyExists):
    detail = ErrorCode.EMAIL_TAKEN


class UserNotFound(NotFound):
    detail = ErrorCode.NOT_FOUND


