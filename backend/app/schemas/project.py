from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid

# Branch schemas
class BranchBase(BaseModel):
    name: str
    color: str = "#3b82f6"

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: uuid.UUID
    commitCount: int
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: uuid.UUID
    branches: List[BranchResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectListResponse(ProjectBase):
    id: uuid.UUID
    lastModified: datetime
    branches: List[dict]  # Simplified for list view
    totalCommits: int
    contributors: List[str]
    
    class Config:
        from_attributes = True

# Commit schemas
class CommitBase(BaseModel):
    message: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=100)
    branch_name: str

class CommitCreate(CommitBase):
    parent_commit_id: Optional[uuid.UUID] = None
    graph_x: int = 0
    graph_y: int = 0

class CommitResponse(CommitBase):
    id: uuid.UUID
    project_id: uuid.UUID
    parent_commit_id: Optional[uuid.UUID]
    graph_x: int
    graph_y: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# File schemas
class FileBase(BaseModel):
    filename: str
    file_path: str
    file_type: str

class FileCreate(FileBase):
    file_size: int
    content_hash: str

class FileResponse(FileBase):
    id: uuid.UUID
    file_size: int
    storage_path: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Upload schemas
class ProjectUpload(BaseModel):
    """Schema for SolidWorks plugin uploads"""
    commit_message: str
    author: str
    branch_name: str = "main"
    parent_commit_id: Optional[uuid.UUID] = None
    files: List[dict]  # File manifest from SolidWorks
    
class UploadResponse(BaseModel):
    commit_id: uuid.UUID
    message: str
    files_uploaded: int
    total_size: int