"""
Configuration settings for Campus Connect Backend
Loads from environment variables with Docker support
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    API_PORT: int = Field(default=8000, env="API_PORT")
    API_RELOAD: bool = Field(default=True, env="API_RELOAD")
    
    # Application Metadata
    APP_NAME: str = "Campus Connect API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-powered Campus Connect Platform API"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # PostgreSQL Configuration
    POSTGRES_HOST: str = Field(default="localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(default=5432, env="POSTGRES_PORT")
    POSTGRES_USER: str = Field(default="postgres", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(default="postgres", env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field(default="campus_connect", env="POSTGRES_DB")
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct PostgreSQL database URL"""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def DATABASE_URL_ASYNC(self) -> str:
        """Construct async PostgreSQL database URL"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # MongoDB Configuration
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", env="MONGODB_URL")
    MONGODB_DB: str = Field(default="campus_connect", env="MONGODB_DB")
    
    # Redis Configuration
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    @property
    def REDIS_URL(self) -> str:
        """Construct Redis URL"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # Weaviate Configuration
    WEAVIATE_URL: str = Field(default="http://localhost:8080", env="WEAVIATE_URL")
    WEAVIATE_API_KEY: Optional[str] = Field(default=None, env="WEAVIATE_API_KEY")
    
    # Neo4j Configuration
    NEO4J_URI: str = Field(default="bolt://localhost:7687", env="NEO4J_URI")
    NEO4J_USER: str = Field(default="neo4j", env="NEO4J_USER")
    NEO4J_PASSWORD: str = Field(default="neo4j", env="NEO4J_PASSWORD")
    
    # JWT Configuration
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ],
        env="CORS_ORIGINS"
    )
    
    # Upload Configuration
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE: int = Field(default=10485760, env="MAX_UPLOAD_SIZE")  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".doc"]
    
    # ATS Configuration
    DEFAULT_MINIMUM_ATS_SCORE: float = Field(default=50.0, env="DEFAULT_MINIMUM_ATS_SCORE")
    SKILL_SIMILARITY_THRESHOLD: float = Field(default=0.7, env="SKILL_SIMILARITY_THRESHOLD")
    
    # Scoring Weights
    SCORING_WEIGHTS: dict = {
        "skill": 0.40,
        "keyword": 0.25,
        "experience": 0.20,
        "education": 0.10,
        "format": 0.05
    }
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
