import os
from datetime import datetime, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fairgig-secret-key-softec-2026-change-in-production")
ALGORITHM = "HS256"
security = HTTPBearer()


def require_advocate(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role", "worker")
        if role not in ("advocate", "verifier"):
            raise HTTPException(status_code=403, detail="Advocate or verifier access required")
        return {"id": int(payload.get("sub")), "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
