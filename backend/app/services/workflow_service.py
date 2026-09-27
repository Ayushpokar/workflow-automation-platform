from sqlalchemy.orm import Session
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate
from app.services.workflow_validation import validate_workflow_definition, WorkflowValidationError

def create_workflow(db: Session, user_id: int, payload: WorkflowCreate) -> Workflow:
    validate_workflow_definition(payload.definition)

    workflow = Workflow(user_id=user_id, name=payload.name, definition=payload.definition)
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

def get_workflows_for_user(db: Session, user_id: int) -> list[Workflow]:
    return db.query(Workflow).filter(Workflow.user_id == user_id).order_by(Workflow.created_at.desc()).all()

def get_workflow_or_none(db: Session, workflow_id: int, user_id: int) -> Workflow | None:
    return db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == user_id,
    ).first()

def update_workflow(db: Session, workflow: Workflow, payload: WorkflowUpdate) -> Workflow:
    if payload.definition is not None:
        validate_workflow_definition(payload.definition)
        workflow.definition = payload.definition
    if payload.name is not None:
        workflow.name = payload.name
    if payload.is_enabled is not None:
        workflow.is_enabled = payload.is_enabled

    db.commit()
    db.refresh(workflow)
    return workflow

def delete_workflow(db: Session, workflow: Workflow) -> None:
    db.delete(workflow)
    db.commit()