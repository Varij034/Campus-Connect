"""
Chat API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.schemas.chat import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageSend,
    ChatMessageResponse, ChatMessage
)
from app.core.dependencies import get_current_user
from app.models.postgres_models import User
from app.services.chat_service import (
    create_chat_session, get_chat_sessions, get_chat_session,
    add_message_to_session, delete_chat_session
)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    current_user: User = Depends(get_current_user)
):
    """List all chat sessions for current user"""
    try:
        sessions = get_chat_sessions(current_user.id)
        return sessions
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new chat session"""
    try:
        session = create_chat_session(
            current_user.id,
            current_user.role,
            session_data.title
        )
        return session
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get chat session by ID"""
    try:
        session = get_chat_session(session_id, current_user.id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        return session
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message_data: ChatMessageSend,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a chat session"""
    try:
        # Verify session exists
        session = get_chat_session(session_id, current_user.id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        # Add user message
        updated_session = add_message_to_session(
            session_id,
            current_user.id,
            "user",
            message_data.content
        )
        
        # TODO: Generate AI response and add it
        # For now, return the user message
        ai_response = "This is a placeholder AI response. Implement AI chat integration here."
        updated_session = add_message_to_session(
            session_id,
            current_user.id,
            "assistant",
            ai_response
        )
        
        # Get the last message
        last_message = updated_session.messages[-1] if updated_session.messages else None
        
        return ChatMessageResponse(
            message=last_message,
            session_id=session_id
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )


@router.post("/messages", response_model=ChatMessageResponse)
async def send_message_new_session(
    message_data: ChatMessageSend,
    current_user: User = Depends(get_current_user)
):
    """Send a message, creating a new session if needed"""
    try:
        session_id = message_data.session_id
        
        if not session_id:
            # Create new session
            session = create_chat_session(
                current_user.id,
                current_user.role
            )
            session_id = session.session_id
        else:
            # Verify session exists
            session = get_chat_session(session_id, current_user.id)
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found"
                )
        
        # Add user message
        updated_session = add_message_to_session(
            session_id,
            current_user.id,
            "user",
            message_data.content
        )
        
        # TODO: Generate AI response
        ai_response = "This is a placeholder AI response. Implement AI chat integration here."
        updated_session = add_message_to_session(
            session_id,
            current_user.id,
            "assistant",
            ai_response
        )
        
        last_message = updated_session.messages[-1] if updated_session.messages else None
        
        return ChatMessageResponse(
            message=last_message,
            session_id=session_id
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a chat session"""
    try:
        session = get_chat_session(session_id, current_user.id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        delete_chat_session(session_id, current_user.id)
        return None
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {str(e)}"
        )
