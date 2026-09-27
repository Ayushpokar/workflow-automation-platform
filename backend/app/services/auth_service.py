from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.auth import UserRegister

def get_user_by_email(db: Session, email:str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def register_user(db: Session, user_data: UserRegister) -> User:
    existing = get_user_by_email(db, user_data.email)
    if existing:
        raise ValueError("Email already registered")
    user = User(
        name= user_data.name,
        email= user_data.email,
        hashed_password = hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db:Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


