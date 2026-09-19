import time
import datetime
import jwt
import bcrypt
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from app.config import settings
from app.db.mongo import mongo_db

router = APIRouter(tags=["Authentication"])

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Quant Researcher"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_jwt_token(user_id: str, email: str, full_name: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "full_name": full_name,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

@router.post("/auth/signup", response_model=AuthTokenResponse)
async def signup(req: SignupRequest):
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email address format.")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    coll = mongo_db.get_collection("users")
    if coll is None:
        raise HTTPException(status_code=500, detail="MongoDB Atlas connection unavailable.")

    existing_user = coll.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = hash_password(req.password)
    user_id = f"usr_{int(time.time() * 1000)}"
    user_doc = {
        "user_id": user_id,
        "email": email_clean,
        "password_hash": hashed_pw,
        "full_name": req.full_name or "Quant Researcher",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    coll.insert_one(user_doc)

    token = create_jwt_token(user_id, email_clean, user_doc["full_name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email_clean,
            "full_name": user_doc["full_name"]
        }
    }

@router.post("/auth/login", response_model=AuthTokenResponse)
async def login(req: LoginRequest):
    email_clean = req.email.strip().lower()
    coll = mongo_db.get_collection("users")
    if coll is None:
        raise HTTPException(status_code=500, detail="MongoDB Atlas connection unavailable.")

    user = coll.find_one({"email": email_clean})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password credentials.")

    token = create_jwt_token(user["user_id"], user["email"], user.get("full_name", "Quant Researcher"))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["user_id"],
            "email": user["email"],
            "full_name": user.get("full_name", "Quant Researcher")
        }
    }

@router.get("/auth/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return {
            "id": payload["sub"],
            "email": payload["email"],
            "full_name": payload.get("full_name", "Quant Researcher")
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
