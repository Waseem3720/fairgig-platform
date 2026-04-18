from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, RefreshToken
from schemas import (
    UserRegister, UserLogin, TokenRefreshRequest,
    PasswordChangeRequest, UserUpdateRequest,
    UserResponse, TokenResponse, MessageResponse,
)
from auth_utils import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user, require_role,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

router = APIRouter()


# ──────────────────────────────────────────────
# Registration
# ──────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user and return JWT tokens."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        city=payload.city,
        platform=payload.platform,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(db_refresh)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


# ──────────────────────────────────────────────
# Login
# ──────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(db_refresh)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


# ──────────────────────────────────────────────
# Token Refresh
# ──────────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    decoded = decode_token(payload.refresh_token)

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    # Check if refresh token exists and is not revoked
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == payload.refresh_token,
        RefreshToken.is_revoked == False,
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Refresh token revoked or not found")

    user_id = int(decoded.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Revoke old refresh token
    db_token.is_revoked = True

    # Issue new tokens
    new_access = create_access_token(data={"sub": str(user.id), "role": user.role})
    new_refresh = create_refresh_token(data={"sub": str(user.id)})

    db_refresh = RefreshToken(
        user_id=user.id,
        token=new_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(db_refresh)
    db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user=UserResponse.model_validate(user),
    )


# ──────────────────────────────────────────────
# Logout
# ──────────────────────────────────────────────
@router.post("/logout", response_model=MessageResponse)
def logout(
    payload: TokenRefreshRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke refresh token on logout."""
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == payload.refresh_token,
        RefreshToken.user_id == current_user.id,
    ).first()

    if db_token:
        db_token.is_revoked = True
        db.commit()

    return MessageResponse(message="Logged out successfully")


# ──────────────────────────────────────────────
# Profile
# ──────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_profile(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.city is not None:
        current_user.city = payload.city
    if payload.platform is not None:
        current_user.platform = payload.platform

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change current user's password."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated successfully")


# ──────────────────────────────────────────────
# User listing (advocate only)
# ──────────────────────────────────────────────
@router.get("/users", response_model=list[UserResponse])
def list_users(
    role: str = None,
    city: str = None,
    current_user: User = Depends(require_role("advocate", "verifier")),
    db: Session = Depends(get_db),
):
    """List all users. Accessible by advocates and verifiers."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if city:
        query = query.filter(User.city == city)
    return [UserResponse.model_validate(u) for u in query.all()]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)
