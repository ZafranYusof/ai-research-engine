from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
import hashlib
import os

router = APIRouter()

# Use passlib if available, fallback to hashlib
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    def verify_password(password: str, hashed: str) -> bool:
        return pwd_context.verify(password, hashed)
except Exception:
    # Fallback: SHA-256 with salt
    def hash_password(password: str) -> str:
        salt = os.urandom(16).hex()
        hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
        return f"{salt}${hashed}"
    def verify_password(password: str, hashed: str) -> bool:
        salt, stored_hash = hashed.split("$", 1)
        return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == stored_hash

# In-memory users (replace with DB)
users_db = {}


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(request: RegisterRequest):
    try:
        if request.email in users_db:
            raise HTTPException(status_code=400, detail="Email already registered")

        users_db[request.email] = {
            "email": request.email,
            "name": request.name,
            "password_hash": hash_password(request.password),
            "created_at": datetime.utcnow().isoformat(),
        }

        token = _create_token(request.email)
        return {"token": token, "user": {"email": request.email, "name": request.name}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest):
    try:
        user = users_db.get(request.email)
        if not user or not verify_password(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = _create_token(request.email)
        return {"token": token, "user": {"email": user["email"], "name": user["name"]}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.get("/debug")
async def debug_auth():
    """Debug endpoint to check auth dependencies."""
    info = {}
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        test_hash = ctx.hash("test")
        info["passlib"] = "ok"
        info["bcrypt_hash"] = test_hash[:20] + "..."
    except Exception as e:
        info["passlib"] = f"error: {str(e)}"
    try:
        from jose import jwt as jose_jwt
        token = jose_jwt.encode({"test": True}, "secret", algorithm="HS256")
        info["jose"] = "ok"
    except Exception as e:
        info["jose"] = f"error: {str(e)}"
    info["hash_method"] = "passlib" if "passlib" in str(hash_password) else "fallback"
    return info

def _create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
