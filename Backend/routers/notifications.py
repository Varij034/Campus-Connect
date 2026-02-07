"""Server-Sent Events for realtime notifications"""

import asyncio
import json
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyQuery
from sqlalchemy.orm import Session

from database.postgres import get_db
from database.models import User
from auth.jwt_handler import verify_token
from auth.dependencies import credentials_exception

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

# In-memory: user_id -> asyncio.Queue of event dicts (for single-instance deployment)
_user_queues: Dict[int, asyncio.Queue] = {}
_queues_lock = asyncio.Lock()


async def _get_queue(user_id: int) -> asyncio.Queue:
    async with _queues_lock:
        if user_id not in _user_queues:
            _user_queues[user_id] = asyncio.Queue(maxsize=100)
        return _user_queues[user_id]


def notify_user(user_id: int, event: Dict[str, Any]) -> None:
    """Push an event to a user's queue (call from other routers)."""
    q = _user_queues.get(user_id)
    if q and not q.full():
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            pass


@router.get("/stream")
async def stream_notifications(
    token: str = APIKeyQuery(name="token", auto_error=False),
    db: Session = Depends(get_db),
):
    """SSE stream for the authenticated user. Pass token as query param: ?token=JWT."""
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    token_data = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == token_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    queue = await _get_queue(user.id)

    async def event_generator():
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
