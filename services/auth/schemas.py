from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    worker = "worker"
    verifier = "verifier"
    advocate = "advocate"


# ---- Request Schemas ----

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.worker
    city: Optional[str] = None
    platform: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    platform: Optional[str] = None


# ---- Response Schemas ----

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    city: Optional[str] = None
    platform: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
