"""
Pydantic models for MongoDB documents
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    """Chat session document"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: int = Field(..., description="User ID from PostgreSQL")
    role: str = Field(..., description="User role: 'student' or 'hr'")
    session_id: str = Field(..., description="Unique session identifier")
    messages: List[ChatMessage] = Field(default_factory=list)
    title: Optional[str] = Field(None, description="Session title")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class JSONDataDocument(BaseModel):
    """Flexible JSON data document"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    collection_name: str = Field(..., description="Collection identifier")
    data: Dict[str, Any] = Field(..., description="Flexible JSON data")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
