from pydantic import BaseModel, EmailStr


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    code: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class AppleAuthRequest(BaseModel):
    id_token: str
    first_name: str | None = None
    last_name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class OrgLoginRequest(BaseModel):
    email: EmailStr
    password: str


class OrgRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    org_name: str
    industry: str | None = None
    country: str | None = None
