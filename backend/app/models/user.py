from sqlalchemy.orm import mapped_column, Mapped
from typing import Optional
from sqlalchemy import DateTime,Boolean
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime
import sqlalchemy as sa


class User(Base):
    __tablename__= "users"
    
    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    name:Mapped[str] = mapped_column(unique=False, index=True, nullable=False)
    email:Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    hashed_password:Mapped[Optional[str]] = mapped_column(nullable=True)
    is_active:Mapped[bool] = mapped_column(Boolean, server_default=sa.text('true'),default=True)
    last_login:Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())