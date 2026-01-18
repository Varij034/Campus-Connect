"""
Chat schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """Chat message schema"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    timestamp: Optional[datetime] = None


class ChatSessionCreate(BaseModel):
    """Create chat session"""
    title: Optional[str] = None


class ChatSessionResponse(BaseModel):
    """Chat session response"""
    id: str
    user_id: int
    role: str
    session_id: str
    title: Optional[str] = None
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime


class ChatMessageSend(BaseModel):
    """Send chat message"""
    content: str
    session_id: Optional[str] = None  # If None, creates new session


class ChatMessageResponse(BaseModel):
    """Chat message response"""
    message: ChatMessage
    session_id: str
