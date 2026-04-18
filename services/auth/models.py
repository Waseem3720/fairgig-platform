import enum
from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class UserRole(str, enum.Enum):
    worker = "worker"
    verifier = "verifier"
    advocate = "advocate"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.worker)
    city = Column(String(50), nullable=True)
    platform = Column(String(50), nullable=True)  # Primary platform (e.g., Careem, Foodpanda)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    token = Column(String(500), unique=True, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
