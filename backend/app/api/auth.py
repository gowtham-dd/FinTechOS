import time
import datetime
import secrets
import hashlib
import asyncio
import jwt
import bcrypt
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from app.config import settings
from app.db.mongo import mongo_db
from app.db.user_db import user_db

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
    salt = bcrypt.gensalt(rounds=10)
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

    existing_user = user_db.find_by_email(email_clean)
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = await asyncio.to_thread(hash_password, req.password)
    user_id = f"usr_{int(time.time() * 1000)}"
    user_doc = {
        "user_id": user_id,
        "email": email_clean,
        "password_hash": hashed_pw,
        "full_name": req.full_name or "Quant Researcher",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    user_db.create_user(user_doc)

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

    user = user_db.find_by_email(email_clean)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password credentials.")

    is_valid = await asyncio.to_thread(verify_password, req.password, user.get("password_hash", ""))
    if not is_valid:
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

@router.post("/auth/demo", response_model=AuthTokenResponse)
async def login_demo():
    """1-Click Sample Quant Account Access for testing & evaluation."""
    t0 = time.time()
    demo_email = "gowtham@fintech-os.io"
    demo_name = "Gowtham"
    
    user_id = "usr_gowtham_quant_master"
    user = user_db.find_by_email(demo_email)
    t1 = time.time()
    if not user:
        hashed_pw = await asyncio.to_thread(hash_password, "gowtham123")
        user_doc = {
            "user_id": user_id,
            "email": demo_email,
            "password_hash": hashed_pw,
            "full_name": demo_name,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        user_db.create_user(user_doc)
    else:
        user_id = user["user_id"]
        demo_name = user.get("full_name", demo_name)
    t2 = time.time()

    token = create_jwt_token(user_id, demo_email, demo_name)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": demo_email,
            "full_name": demo_name
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


class CreateApiKeyRequest(BaseModel):
    name: str

class UpdateApiKeyRequest(BaseModel):
    name: str

in_memory_api_keys = []

@router.post("/auth/api-keys/generate")
async def generate_api_key(req: CreateApiKeyRequest, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    key_name = req.name.strip() or "Default API Key"
    
    raw_secret = secrets.token_urlsafe(32)
    raw_key = f"ft_live_{raw_secret}"
    key_prefix = f"{raw_key[:12]}..."
    key_id = f"key_{int(time.time() * 1000)}"
    hashed_key = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    created_at = time.strftime("%Y-%m-%d %H:%M:%S")

    doc = {
        "key_id": key_id,
        "user_id": user["id"],
        "name": key_name,
        "key_prefix": key_prefix,
        "hashed_key": hashed_key,
        "created_at": created_at,
        "is_active": True
    }

    coll = mongo_db.get_collection("api_keys")
    if coll is not None:
        try:
            coll.insert_one(doc)
        except Exception as e:
            print(f"[API Key] MongoDB insert error: {e}")
            in_memory_api_keys.append(doc)
    else:
        in_memory_api_keys.append(doc)

    return {
        "key_id": key_id,
        "name": key_name,
        "raw_key": raw_key,
        "key_prefix": key_prefix,
        "created_at": created_at
    }

@router.get("/auth/api-keys")
async def list_api_keys(authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    user_id = user["id"]
    
    keys = []
    coll = mongo_db.get_collection("api_keys")
    if coll is not None:
        try:
            cursor = coll.find({"user_id": user_id, "is_active": True})
            for item in cursor:
                keys.append({
                    "key_id": item["key_id"],
                    "name": item["name"],
                    "key_prefix": item["key_prefix"],
                    "created_at": item.get("created_at", ""),
                    "is_active": item.get("is_active", True)
                })
        except Exception as e:
            print(f"[API Key] MongoDB fetch error: {e}")
            keys = [k for k in in_memory_api_keys if k["user_id"] == user_id and k.get("is_active", True)]
    else:
        keys = [k for k in in_memory_api_keys if k["user_id"] == user_id and k.get("is_active", True)]

    return {"api_keys": keys}

@router.patch("/auth/api-keys/{key_id}")
async def update_api_key(key_id: str, req: UpdateApiKeyRequest, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    user_id = user["id"]
    new_name = req.name.strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="Key name cannot be empty.")

    coll = mongo_db.get_collection("api_keys")
    updated = False
    if coll is not None:
        try:
            res = coll.update_one(
                {"key_id": key_id, "user_id": user_id},
                {"$set": {"name": new_name}}
            )
            if res.modified_count > 0 or res.matched_count > 0:
                updated = True
        except Exception as e:
            print(f"[API Key] MongoDB update error: {e}")

    if not updated:
        for k in in_memory_api_keys:
            if k["key_id"] == key_id and k["user_id"] == user_id:
                k["name"] = new_name
                updated = True
                break

    if not updated:
        raise HTTPException(status_code=404, detail="API Key not found or unauthorized.")

    return {"status": "success", "key_id": key_id, "name": new_name}

@router.delete("/auth/api-keys/{key_id}")
async def delete_api_key(key_id: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    user_id = user["id"]

    coll = mongo_db.get_collection("api_keys")
    deleted = False
    if coll is not None:
        try:
            res = coll.delete_one({"key_id": key_id, "user_id": user_id})
            if res.deleted_count > 0:
                deleted = True
        except Exception as e:
            print(f"[API Key] MongoDB delete error: {e}")

    global in_memory_api_keys
    in_memory_api_keys = [k for k in in_memory_api_keys if not (k["key_id"] == key_id and k["user_id"] == user_id)]
    
    return {"status": "success", "key_id": key_id, "message": "API key successfully revoked and deleted."}

