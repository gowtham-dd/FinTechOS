import json
import asyncio
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from app.agents.factory import agent_factory, AGENT_REGISTRY
from app.models.artifacts import AgentMetadata, WorkflowExecutionState
from app.memory.store import memory_store

router = APIRouter(prefix="/agents", tags=["Agents"])

class AgentBuildRequest(BaseModel):
    goal: str
    max_investigations: int = 50

@router.get("", response_model=List[AgentMetadata])
async def get_all_agents():
    """Retrieve list of all 16 Minecraft-themed specialized agents."""
    return agent_factory.get_all_agents()

@router.post("/build", response_model=WorkflowExecutionState)
async def build_and_execute_agent(req: AgentBuildRequest):
    """Generates DAG workflow from natural language prompt and executes multi-agent system."""
    if not req.goal:
        raise HTTPException(status_code=400, detail="Goal cannot be empty")
        
    state = await agent_factory.execute_agent_workflow(
        goal=req.goal,
        max_investigations=req.max_investigations
    )
    
    await memory_store.set(f"execution:{state.execution_id}", state.model_dump())
    return state

@router.get("/stream")
async def stream_agent_execution(goal: str = "Prioritize AML investigations", max_investigations: int = 50):
    """
    Server-Sent Events (SSE) stream broadcasting live agent execution steps,
    glowing status updates, and artifact generation in real-time.
    """
    async def event_generator():
        dag = await agent_factory.generate_workflow_dag(goal)
        yield f"data: {json.dumps({'type': 'init', 'dag': dag, 'total_steps': len(dag)})}\n\n"
        await asyncio.sleep(0.3)

        for idx, agent_id in enumerate(dag):
            agent = AGENT_REGISTRY.get(agent_id, AGENT_REGISTRY["data_ingestion"])
            step_event = {
                "type": "step",
                "step_index": idx + 1,
                "agent_id": agent.id,
                "agent_name": agent.name,
                "role": agent.role,
                "status": "executing",
                "progress_pct": round(((idx + 1) / len(dag)) * 100, 1),
                "timestamp": time.strftime("%H:%M:%S")
            }
            yield f"data: {json.dumps(step_event)}\n\n"
            await asyncio.sleep(0.4)

        # Final state event
        final_state = await agent_factory.execute_agent_workflow(goal, max_investigations)
        yield f"data: {json.dumps({'type': 'complete', 'state': final_state.model_dump()})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/latest", response_model=Dict[str, Any])
async def get_latest_execution():
    """Gets sample default execution state for instant UI loading."""
    state = await agent_factory.execute_agent_workflow(
        goal="Prioritize AML investigations from Bitcoin transaction network under capacity constraints",
        max_investigations=50
    )
    return state.model_dump()
