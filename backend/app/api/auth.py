from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    users_db[request.email] = {
        "email": request.email,
        "name": request.name,
        "password_hash": pwd_context.hash(request.password),
        "created_at": datetime.utcnow().isoformat(),
    }

    token = _create_token(request.email)
    return {"token": token, "user": {"email": request.email, "name": request.name}}


@router.post("/login")
async def login(request: LoginRequest):
    user = users_db.get(request.email)
    if not user or not pwd_context.verify(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_token(request.email)
    return {"token": token, "user": {"email": user["email"], "name": user["name"]}}


def _create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
