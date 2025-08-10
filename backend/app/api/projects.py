from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.project import Project, Branch, Commit
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectListResponse
from app.services.project_service import ProjectService

router = APIRouter()

@router.get("/projects", response_model=List[ProjectListResponse])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects for the user"""
    try:
        projects = db.query(Project).all()
        
        result = []
        for project in projects:
            # Get branch info
            branches = db.query(Branch).filter(Branch.project_id == project.id).all()
            
            # Get commit count and last modified
            commits = db.query(Commit).filter(Commit.project_id == project.id).all()
            
            # Get unique contributors
            contributors = list(set([commit.author for commit in commits]))
            
            result.append(ProjectListResponse(
                id=project.id,
                name=project.name,
                description=project.description,
                lastModified=commits[-1].created_at if commits else project.created_at,
                branches=[{
                    "id": branch.id,
                    "name": branch.name,
                    "commitCount": len([c for c in commits if c.branch_name == branch.name]),
                    "color": branch.color
                } for branch in branches],
                totalCommits=len(commits),
                contributors=contributors
            ))
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching projects: {str(e)}"
        )

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    """Create a new project"""
    try:
        # Create project
        project = Project(
            name=project_data.name,
            description=project_data.description
        )
        db.add(project)
        db.flush()  # Get the ID
        
        # Create main branch
        main_branch = Branch(
            name="main",
            color="#3b82f6",
            project_id=project.id
        )
        db.add(main_branch)
        
        db.commit()
        db.refresh(project)
        
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            branches=[{
                "id": main_branch.id,
                "name": main_branch.name,
                "commitCount": 0,
                "color": main_branch.color
            }],
            created_at=project.created_at
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Get branches and commits
        branches = db.query(Branch).filter(Branch.project_id == project.id).all()
        commits = db.query(Commit).filter(Commit.project_id == project.id).all()
        
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            branches=[{
                "id": branch.id,
                "name": branch.name,
                "commitCount": len([c for c in commits if c.branch_name == branch.name]),
                "color": branch.color
            } for branch in branches],
            created_at=project.created_at
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching project: {str(e)}"
        )

@router.delete("/projects/{project_id}")
async def delete_project(project_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a project and all its data"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        db.delete(project)
        db.commit()
        
        return {"message": "Project deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project: {str(e)}"
        )