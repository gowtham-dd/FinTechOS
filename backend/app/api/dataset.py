from fastapi import APIRouter
from typing import Dict, Any, List
from app.data.elliptic_loader import elliptic_loader
from app.models.artifacts import CaseCandidate

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.get("/summary", response_model=Dict[str, Any])
async def get_dataset_summary():
    """Retrieve summary metrics of the Elliptic Bitcoin transaction graph."""
    return elliptic_loader.get_graph_summary()

@router.get("/graph", response_model=Dict[str, Any])
async def get_sample_graph(limit: int = 60):
    """Retrieve sample graph nodes and edges for network visualizer."""
    return elliptic_loader.get_sample_graph(limit_nodes=limit)

@router.get("/candidates", response_model=List[CaseCandidate])
async def get_candidate_cases(limit: int = 100):
    """Retrieve candidate investigation cases."""
    return elliptic_loader.get_candidates(limit=limit)
