# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
import models
from database import get_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Pydantic models for request validation
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

# Helper functions
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Register endpoint
@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        password_hash=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Get current user endpoint
@router.get("/me", response_model=UserResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    # Get session cookie
    session_id = request.cookies.get("session")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find user by session ID (you would typically use a session store)
    # This is a simplified example - you may need to adapt this to your session management
    user = db.query(models.User).filter(models.User.username == session_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return user

# Logout endpoint
@router.post("/logout")
def logout(response: Response):
    # Clear the session cookie
    response.delete_cookie(key="session")
    return {"message": "Logged out successfully"}

# Update your login endpoint to set a cookie
@router.post("/login", response_model=UserResponse)
def login_user(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    # Find user by username
    db_user = get_user_by_username(db, user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Set a simple session cookie with the username
    # In a real app, you'd use a secure, random session ID
    response.set_cookie(
        key="session",
        value=db_user.username,
        httponly=True,
        max_age=1800,  # 30 minutes
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )
    
    # Return user data (without password)
    return db_user