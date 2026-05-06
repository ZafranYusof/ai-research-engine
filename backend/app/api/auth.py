from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.mongodb import mongodb
from app.services.email import send_verification_email, send_reset_email
import hashlib
import os
import uuid

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


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ResendVerificationRequest(BaseModel):
    email: str


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: RegisterRequest, req: Request):
    try:
        # Check if user already exists
        existing = await mongodb.users.find_one({"email": request.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        verification_token = str(uuid.uuid4())
        user_doc = {
            "email": request.email,
            "name": request.name,
            "password_hash": hash_password(request.password),
            "created_at": datetime.utcnow().isoformat(),
            "verified": False,
            "verification_token": verification_token,
            "verification_expires": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        }
        await mongodb.users.insert_one(user_doc)

        # Send verification email (or log token in dev)
        try:
            send_verification_email(request.email, verification_token)
        except Exception:
            pass  # Don't fail registration if email fails

        token = _create_token(request.email)
        return {"token": token, "user": {"email": request.email, "name": request.name, "verified": False}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: LoginRequest, req: Request):
    try:
        user = await mongodb.users.find_one({"email": request.email})
        if not user or not verify_password(request.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = _create_token(request.email)
        return {
            "token": token,
            "user": {
                "email": user["email"],
                "name": user["name"],
                "verified": user.get("verified", True),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/verify")
async def verify_email(request: VerifyRequest):
    user = await mongodb.users.find_one({"verification_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    # Check expiry
    expires = user.get("verification_expires")
    if expires:
        exp_dt = datetime.fromisoformat(expires)
        if datetime.utcnow() > exp_dt:
            raise HTTPException(status_code=400, detail="Verification token has expired")

    await mongodb.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"verified": True}, "$unset": {"verification_token": "", "verification_expires": ""}}
    )
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
@limiter.limit("3/minute")
async def resend_verification(request: ResendVerificationRequest, req: Request):
    user = await mongodb.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email is registered, a verification link has been sent"}

    if user.get("verified"):
        return {"message": "Email is already verified"}

    new_token = str(uuid.uuid4())
    await mongodb.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "verification_token": new_token,
            "verification_expires": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        }}
    )

    try:
        send_verification_email(request.email, new_token)
    except Exception:
        pass

    return {"message": "If the email is registered, a verification link has been sent"}


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: ForgotPasswordRequest, req: Request):
    user = await mongodb.users.find_one({"email": request.email})

    if user:
        reset_token = str(uuid.uuid4())
        await mongodb.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_token": reset_token,
                "reset_expires": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            }}
        )
        try:
            send_reset_email(request.email, reset_token)
        except Exception:
            pass

    # Always return success (don't reveal if email exists)
    return {"message": "If the email is registered, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    user = await mongodb.users.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Check expiry
    expires = user.get("reset_expires")
    if expires:
        exp_dt = datetime.fromisoformat(expires)
        if datetime.utcnow() > exp_dt:
            raise HTTPException(status_code=400, detail="Reset token has expired")

    await mongodb.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": hash_password(request.new_password)},
            "$unset": {"reset_token": "", "reset_expires": ""}
        }
    )
    return {"message": "Password reset successfully"}


def _create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
