from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import psutil
import os

from app.database import get_db

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Get system info
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": db_status,
        "system": {
            "memory_usage_percent": memory.percent,
            "disk_usage_percent": disk.percent,
            "storage_path_exists": os.path.exists("app/storage")
        }
    }

@router.get("/info")
async def api_info():
    """Basic API information"""
    return {
        "name": "SolidWorks PDM API",
        "version": "1.0.0",
        "description": "GitHub for CAD Files",
        "endpoints": {
            "projects": "/api/v1/projects",
            "commits": "/api/v1/commits",
            "files": "/api/v1/files",
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }