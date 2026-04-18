import os
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fairgig-secret-key-softec-2026-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

def get_current_user_role(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    payload = decode_token(credentials.credentials)
    return {"id": int(payload.get("sub")), "role": payload.get("role", "worker")}

def require_role(*roles):
    def role_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ):
        payload = decode_token(credentials.credentials)
        user_role = payload.get("role", "worker")
        if user_role not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return {"id": int(payload.get("sub")), "role": user_role}
    return role_checker
