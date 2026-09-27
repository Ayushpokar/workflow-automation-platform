from datetime import datetime
from pydantic import BaseModel, Field

class WorkflowCreate(BaseModel):
    name: str
    definition: dict = Field(..., examples=[{"nodes": [], "edges": []}])

class WorkflowUpdate(BaseModel):
    name: str | None = None
    definition: dict | None = None
    is_enabled: bool | None = None

class WorkflowResponse(BaseModel):
    id: int
    name: str
    is_enabled: bool
    definition: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True