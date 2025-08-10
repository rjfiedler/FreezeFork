from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    commits = relationship("Commit", back_populates="project", cascade="all, delete-orphan")
    branches = relationship("Branch", back_populates="project", cascade="all, delete-orphan")

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    color = Column(String, default="#3b82f6")  # Hex color for UI
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    head_commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="branches")
    head_commit = relationship("Commit", foreign_keys=[head_commit_id])

class Commit(Base):
    __tablename__ = "commits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    branch_name = Column(String, nullable=False)
    parent_commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id"), nullable=True)
    
    # Git-like graph positioning for frontend
    graph_x = Column(Integer, default=0)
    graph_y = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="commits")
    parent_commit = relationship("Commit", remote_side=[id])
    files = relationship("CommitFile", back_populates="commit", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Original path in SolidWorks
    file_size = Column(Integer)
    file_type = Column(String)  # .SLDPRT, .SLDASM, .SLDDRW
    content_hash = Column(String, unique=True)  # SHA256 for deduplication
    storage_path = Column(String, nullable=False)  # Where file is stored on disk
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    commit_files = relationship("CommitFile", back_populates="file")

class CommitFile(Base):
    """Junction table linking commits to files"""
    __tablename__ = "commit_files"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id"))
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"))
    file_path = Column(String)  # Path within the assembly structure
    is_main_assembly = Column(Boolean, default=False)
    
    # Relationships
    commit = relationship("Commit", back_populates="files")
    file = relationship("File", back_populates="commit_files")