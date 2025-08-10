from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="SolidWorks PDM API",
    description="GitHub for CAD Files - Backend API",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "SolidWorks PDM API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/projects")
async def get_projects():
    return [
        {
            "id": "proj-1",
            "name": "Robotic Arm Assembly",
            "description": "6-DOF robotic arm for manufacturing automation",
            "lastModified": "2025-08-10T14:30:00Z",
            "branches": [
                {"id": "main", "name": "main", "commitCount": 8, "color": "#3b82f6"},
                {"id": "lightweight", "name": "lightweight", "commitCount": 2, "color": "#10b981"}
            ],
            "totalCommits": 10,
            "contributors": ["John Smith", "Sarah Johnson"]
        }
    ]