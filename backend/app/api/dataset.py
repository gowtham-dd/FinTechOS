from fastapi import APIRouter
from typing import Dict, Any, List
from app.data.elliptic_loader import EllipticGraphLoader
from app.models.artifacts import CaseCandidate
from app.ml.gnn_aml import GNNAMLClassifier, gnn_model

router = APIRouter(prefix="/dataset", tags=["Dataset"])
elliptic_loader = EllipticGraphLoader()

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
    return elliptic_loader.candidates[:limit]

@router.post("/gnn-train", response_model=Dict[str, Any])
async def train_gnn_aml_model(epochs: int = 50, lr: float = 0.01):
    """Trains 2-Layer Graph Convolutional Network (GCN) for Bitcoin AML illicit node detection."""
    results = gnn_model.train_and_evaluate(epochs=epochs, lr=lr)
    return results
