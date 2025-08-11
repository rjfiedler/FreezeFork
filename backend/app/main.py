from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import json
import os
from datetime import datetime

# Create FastAPI app
app = FastAPI(
    title="SolidWorks PDM API",
    description="GitHub for CAD Files - Backend API",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: str
    lastModified: str
    branches: List[dict]
    totalCommits: int
    contributors: List[str]

class CommitData(BaseModel):
    id: str
    message: str
    timestamp: str
    author: str
    branch: str
    x: int
    y: int
    parents: List[str]

# In-memory storage (will persist with file storage for deployment)
DATA_FILE = "projects_data.json"

def load_data():
    """Load projects from file or return defaults"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    
    # Default data if file doesn't exist
    return {
        "projects": [
            {
                "id": "proj-1",
                "name": "Robotic Arm Assembly",
                "description": "6-DOF robotic arm for manufacturing automation",
                "lastModified": "2025-08-10T14:30:00Z",
                "branches": [
                    {"id": "main", "name": "main", "commitCount": 8, "color": "#3b82f6"},
                    {"id": "lightweight", "name": "lightweight", "commitCount": 2, "color": "#10b981"},
                    {"id": "extended", "name": "extended", "commitCount": 2, "color": "#f59e0b"}
                ],
                "totalCommits": 12,
                "contributors": ["John Smith", "Sarah Johnson", "Mike Chen"]
            },
            {
                "id": "proj-2", 
                "name": "Conveyor Belt System",
                "description": "Automated conveyor system for warehouse operations",
                "lastModified": "2025-08-08T16:20:00Z",
                "branches": [
                    {"id": "main", "name": "main", "commitCount": 15, "color": "#3b82f6"},
                    {"id": "speed-optimization", "name": "speed-optimization", "commitCount": 4, "color": "#8b5cf6"}
                ],
                "totalCommits": 19,
                "contributors": ["Alice Brown", "Bob Wilson"]
            },
            {
                "id": "proj-3",
                "name": "Hydraulic Press Design", 
                "description": "Industrial hydraulic press for metal forming",
                "lastModified": "2025-08-05T11:45:00Z",
                "branches": [
                    {"id": "main", "name": "main", "commitCount": 22, "color": "#3b82f6"}
                ],
                "totalCommits": 22,
                "contributors": ["Carol Davis", "David Lee", "Eva Martinez", "Frank Taylor"]
            }
        ],
        "commits": {
            "proj-1": [
                {
                    "id": "commit-1",
                    "message": "Initial robotic arm concept",
                    "timestamp": "2025-08-01T09:00:00Z",
                    "author": "John Smith",
                    "branch": "main",
                    "x": 50,
                    "y": 50,
                    "parents": []
                },
                {
                    "id": "commit-2", 
                    "message": "Added base plate design",
                    "timestamp": "2025-08-02T11:30:00Z",
                    "author": "Sarah Johnson", 
                    "branch": "main",
                    "x": 150,
                    "y": 50,
                    "parents": ["commit-1"]
                },
                {
                    "id": "commit-3",
                    "message": "Integrated motor mount system",
                    "timestamp": "2025-08-03T14:15:00Z",
                    "author": "Mike Chen",
                    "branch": "main", 
                    "x": 250,
                    "y": 50,
                    "parents": ["commit-2"]
                },
                {
                    "id": "commit-4",
                    "message": "Added arm segments with joints",
                    "timestamp": "2025-08-04T16:45:00Z",
                    "author": "John Smith",
                    "branch": "main",
                    "x": 350,
                    "y": 50,
                    "parents": ["commit-3"]
                },
                {
                    "id": "commit-5",
                    "message": "Lightweight materials exploration",
                    "timestamp": "2025-08-05T10:20:00Z", 
                    "author": "Sarah Johnson",
                    "branch": "lightweight",
                    "x": 450,
                    "y": 120,
                    "parents": ["commit-4"]
                },
                {
                    "id": "commit-6",
                    "message": "Extended reach prototype", 
                    "timestamp": "2025-08-05T15:30:00Z",
                    "author": "Mike Chen",
                    "branch": "extended",
                    "x": 450,
                    "y": 180,
                    "parents": ["commit-4"]
                },
                {
                    "id": "commit-7",
                    "message": "Optimized joint bearings",
                    "timestamp": "2025-08-09T10:15:00Z",
                    "author": "Sarah Johnson",
                    "branch": "main",
                    "x": 450,
                    "y": 50,
                    "parents": ["commit-4"]
                },
                {
                    "id": "commit-8",
                    "message": "Added gripper mechanism",
                    "timestamp": "2025-08-10T14:30:00Z",
                    "author": "John Smith", 
                    "branch": "main",
                    "x": 550,
                    "y": 50,
                    "parents": ["commit-7"]
                },
                {
                    "id": "commit-9",
                    "message": "Carbon fiber arm segments",
                    "timestamp": "2025-08-11T09:00:00Z",
                    "author": "Sarah Johnson", 
                    "branch": "lightweight",
                    "x": 550,
                    "y": 120,
                    "parents": ["commit-5"]
                },
                {
                    "id": "commit-10",
                    "message": "Extended base for stability",
                    "timestamp": "2025-08-11T14:00:00Z",
                    "author": "Mike Chen", 
                    "branch": "extended",
                    "x": 550,
                    "y": 180,
                    "parents": ["commit-6"]
                }
            ]
        }
    }

def save_data(data):
    """Save projects to file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

# Load initial data
app_data = load_data()

@app.get("/")
async def root():
    return {
        "message": "SolidWorks PDM API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "projects_count": len(app_data["projects"])
    }

@app.get("/api/v1/projects")
async def get_projects():
    """Get all projects"""
    return app_data["projects"]

@app.post("/api/v1/projects")
async def create_project(project: ProjectCreate):
    """Create a new project"""
    new_project = {
        "id": f"proj-{len(app_data['projects']) + 1}",
        "name": project.name,
        "description": project.description or "",
        "lastModified": datetime.utcnow().isoformat(),
        "branches": [
            {"id": "main", "name": "main", "commitCount": 0, "color": "#3b82f6"}
        ],
        "totalCommits": 0,
        "contributors": []
    }
    
    app_data["projects"].append(new_project)
    app_data["commits"][new_project["id"]] = []
    save_data(app_data)
    
    return new_project

@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str):
    """Get a specific project"""
    project = next((p for p in app_data["projects"] if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.get("/api/v1/projects/{project_id}/commits")
async def get_project_commits(project_id: str):
    """Get commits for a project"""
    if project_id not in app_data["commits"]:
        raise HTTPException(status_code=404, detail="Project not found")
    return app_data["commits"][project_id]

@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    project_index = next((i for i, p in enumerate(app_data["projects"]) if p["id"] == project_id), None)
    if project_index is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Remove project and its commits
    app_data["projects"].pop(project_index)
    if project_id in app_data["commits"]:
        del app_data["commits"][project_id]
    
    save_data(app_data)
    return {"message": "Project deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=False
    )