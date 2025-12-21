from src.core.domain.exceptions import NotAuthenticated


class ErrorCode:
    REFRESH_TOKEN_NOT_VALID = "Refresh token is not valid"
    REFRESH_TOKEN_REQUIRED = "Refresh token is required either in the body or cookie"



class RefreshTokenInvalid(NotAuthenticated):
    detail = ErrorCode.REFRESH_TOKEN_NOT_VALID
