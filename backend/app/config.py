import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Quantum FinTech AgentOS"
    API_V1_STR: str = "/api/v1"
    
    # Featherless LLM Settings
    FEATHERLESS_API_KEY: str = os.getenv("FEATHERLESS_API_KEY", "")
    FEATHERLESS_MODEL: str = os.getenv("FEATHERLESS_MODEL", "unsloth/Llama-3.3-70B-Instruct")
    FEATHERLESS_BASE_URL: str = os.getenv("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1")
    
    # Memory & Database Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "backend/data/memory.db")
    
    # MongoDB Atlas Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "fintech_agent_os")
    
    # JWT Auth Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "fintech_os_super_secret_jwt_key_2026_key_99812")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Datasets
    ELLIPTIC_DATA_DIR: str = os.getenv("ELLIPTIC_DATA_DIR", "backend/data/elliptic")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
