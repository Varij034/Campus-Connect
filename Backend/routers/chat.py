"""Chat router for HR AI assistant"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.postgres import get_db
from database.models import User
from database.schemas import ChatMessageRequest, ChatMessageResponse
from chat_engine import ChatOrchestrator
from auth.dependencies import get_current_active_user

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def chat_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Process a chat message and return AI response
    
    Only accessible to recruiters and admins
    """
    # Only recruiters and admins can use chat
    if current_user.role.value not in ["recruiter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters and admins can use the chat feature"
        )
    
    try:
        # Initialize chat orchestrator
        orchestrator = ChatOrchestrator(db)
        
        # Process message
        response_text, data = orchestrator.process_message(request.message)
        
        return ChatMessageResponse(
            response=response_text,
            data=data,
            conversation_id=request.conversation_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat message: {str(e)}"
        )
