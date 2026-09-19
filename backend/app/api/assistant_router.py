from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from app.agents.assistant import assistant
from app.memory.store import memory_store

router = APIRouter(prefix="/assistant", tags=["Personal AI Assistant"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_user"

class ChatResponse(BaseModel):
    response: str
    cache_hit: bool
    hamming_distance: Optional[int] = None
    anonymized_query: str
    redactions_count: Optional[int] = 0
    latency_ms: float
    guardrail_status: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    """
    Chat with Personal AI Assistant.
    Flow: PII Anonymize -> SimHash Cache -> 5-Turn Memory -> User Activity Injection -> LLM / Guardrails.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    res = await assistant.generate_response(
        user_message=req.message,
        session_id=req.session_id or "default_user"
    )
    return res

@router.delete("/history")
async def clear_chat_history(session_id: str = "default_user"):
    """Clears sliding window chat memory for the given session ID."""
    key = f"chat_history:{session_id}"
    await memory_store.set(key, [])
    return {"status": "SUCCESS", "message": f"Chat history cleared for session '{session_id}'."}

@router.get("/activity", response_model=Dict[str, Any])
async def get_user_activity_context():
    """Retrieves current user activity log context from SQLite persistence database."""
    summary = await assistant.get_user_activity_summary()
    return {"user_activity_summary": summary}
