"""
Sistema de autenticación JWT
SaaS con planes Starter/Pro/Enterprise
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db.database import SessionLocal, User

# Configuración
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

router = APIRouter()

# Schemas Pydantic
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    plan: str
    analyses_remaining: int
    
class UserResponse(BaseModel):
    email: str
    plan: str
    analyses_count: int
    analyses_limit: int

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Resetear contador si pasó un mes
        if datetime.utcnow() - user.last_reset > timedelta(days=30):
            user.analyses_count = 0
            user.last_reset = datetime.utcnow()
            db.commit()
        
        return user
    finally:
        db.close()

def check_analysis_limit(user: User):
    """Verifica si el usuario puede hacer más análisis"""
    if user.plan == "enterprise":
        return True
    return user.analyses_count < user.analyses_limit

def increment_analysis_count(user: User):
    """Incrementa el contador de análisis del usuario"""
    db = SessionLocal()
    try:
        user_db = db.query(User).filter(User.id == user.id).first()
        if user_db:
            user_db.analyses_count += 1
            db.commit()
    finally:
        db.close()

# Endpoints
@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    db = SessionLocal()
    try:
        # Verificar si el email ya existe
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Crear nuevo usuario
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            plan="starter",
            analyses_limit=10
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Crear token
        access_token = create_access_token(data={"sub": new_user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "plan": new_user.plan,
            "analyses_remaining": new_user.analyses_limit - new_user.analyses_count
        }
    finally:
        db.close()

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "plan": user.plan,
            "analyses_remaining": user.analyses_limit - user.analyses_count
        }
    finally:
        db.close()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "plan": current_user.plan,
        "analyses_count": current_user.analyses_count,
        "analyses_limit": current_user.analyses_limit
    }

@router.post("/upgrade")
async def upgrade_plan(
    plan: str,  # starter, pro, enterprise
    current_user: User = Depends(get_current_user)
):
    """Actualizar plan del usuario (simulado - en producción integrar con Stripe)"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == current_user.id).first()
        
        limits = {
            "starter": 10,
            "pro": 1000,
            "enterprise": 100000
        }
        
        if plan not in limits:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        user.plan = plan
        user.analyses_limit = limits[plan]
        db.commit()
        
        return {
            "message": f"Plan upgraded to {plan}",
            "new_limit": limits[plan]
        }
    finally:
        db.close()
