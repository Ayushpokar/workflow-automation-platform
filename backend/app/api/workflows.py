from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models import workflow
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowResponse
from app.services import workflow_service
from app.services.workflow_validation import WorkflowValidationError
from app.services.workflow_service import get_workflow_or_none
from app.services.node_executors import run_workflow

router = APIRouter(prefix="/workflows", tags=["workflows"])

@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
def create_workflow(
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return workflow_service.create_workflow(db, current_user.id, payload)
    except WorkflowValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("", response_model=list[WorkflowResponse])
def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return workflow_service.get_workflows_for_user(db, current_user.id)

@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = workflow_service.get_workflow_or_none(db, current_user.id, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: int,
    payload: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = workflow_service.get_workflow_or_none(db, current_user.id, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    try:
        return workflow_service.update_workflow(db, workflow, payload)
    except WorkflowValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = workflow_service.get_workflow_or_none(db, current_user.id, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    workflow_service.delete_workflow(db, workflow)
    
@router.post("/{workflow_id}/run")
def run_workflow_endpoint(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = get_workflow_or_none(db, workflow_id, current_user.id)
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "Workflow not found")
    result = run_workflow(workflow.definition)
    return result