"""
Chat service for managing chat sessions and messages
"""

from typing import List, Optional
from datetime import datetime
import uuid

from app.database.mongodb import get_mongodb
from app.models.mongodb_models import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionCreate, ChatMessageSend


def create_chat_session(user_id: int, role: str, title: Optional[str] = None) -> ChatSession:
    """Create a new chat session"""
    try:
        mongodb = get_mongodb()
    except Exception as e:
        raise RuntimeError(f"MongoDB not connected: {str(e)}")
    
    session_id = str(uuid.uuid4())
    session = ChatSession(
        user_id=user_id,
        role=role,
        session_id=session_id,
        title=title or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        messages=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    mongodb.chat_sessions.insert_one(session.dict(by_alias=True))
    return session


def get_chat_sessions(user_id: int, limit: int = 50) -> List[ChatSession]:
    """Get all chat sessions for a user"""
    try:
        mongodb = get_mongodb()
    except Exception as e:
        raise RuntimeError(f"MongoDB not connected: {str(e)}")
    
    cursor = mongodb.chat_sessions.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).limit(limit)
    
    sessions = []
    for doc in cursor:
        sessions.append(ChatSession(**doc))
    
    return sessions


def get_chat_session(session_id: str, user_id: int) -> Optional[ChatSession]:
    """Get a specific chat session"""
    try:
        mongodb = get_mongodb()
    except Exception as e:
        raise RuntimeError(f"MongoDB not connected: {str(e)}")
    
    doc = mongodb.chat_sessions.find_one({
        "session_id": session_id,
        "user_id": user_id
    })
    
    if doc:
        return ChatSession(**doc)
    return None


def add_message_to_session(
    session_id: str,
    user_id: int,
    role: str,
    content: str
) -> ChatSession:
    """Add a message to a chat session"""
    try:
        mongodb = get_mongodb()
    except Exception as e:
        raise RuntimeError(f"MongoDB not connected: {str(e)}")
    
    message = ChatMessage(
        role=role,
        content=content,
        timestamp=datetime.utcnow()
    )
    
    mongodb.chat_sessions.update_one(
        {"session_id": session_id, "user_id": user_id},
        {
            "$push": {"messages": message.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Return updated session
    return get_chat_session(session_id, user_id)


def delete_chat_session(session_id: str, user_id: int):
    """Delete a chat session"""
    try:
        mongodb = get_mongodb()
        mongodb.chat_sessions.delete_one({
            "session_id": session_id,
            "user_id": user_id
        })
    except Exception as e:
        raise RuntimeError(f"MongoDB not connected: {str(e)}")
