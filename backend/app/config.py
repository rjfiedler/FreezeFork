from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Settings
    api_title: str = "SolidWorks PDM API"
    api_version: str = "1.0.0"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./solidworks_pdm.db"
    
    # File Storage
    storage_path: str = "./app/storage"
    max_file_size: int = 100 * 1024 * 1024  # 100MB per file
    allowed_extensions: List[str] = [".sldprt", ".sldasm", ".slddrw", ".step", ".iges"]
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://solidworks-pdm.vercel.app"
    ]
    
    # Security (for future authentication)
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

# Create global settings instance
settings = Settings()