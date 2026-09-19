import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quantum FinTech AgentOS"
    API_V1_STR: str = "/api/v1"
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_LLM_MODEL: str = "llama-3.3-70b-versatile"
    
    # Memory Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "backend/data/memory.db")
    
    # Datasets
    ELLIPTIC_DATA_DIR: str = os.getenv("ELLIPTIC_DATA_DIR", "backend/data/elliptic")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
