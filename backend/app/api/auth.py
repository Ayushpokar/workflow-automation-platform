from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserRegister,UserLogin, TokenResponse, UserResponse, RefreshRequest
from app.services import auth_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db:Session =Depends(get_db)):
    try:
        user = auth_service.register_user(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail= str(e))
    return user

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db:Session= Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if token_data is None or token_data.get("type") != "refresh":
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )        
    print(token_data)
    user_id = int(token_data.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer"
        )
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id)
    )
    

@router.post("/logout")
def logout(db:Session = Depends(get_db)):
    return None 