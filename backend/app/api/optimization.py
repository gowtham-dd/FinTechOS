from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.data.elliptic_loader import elliptic_loader
from app.models.artifacts import ConstraintSpec
from app.quantum.qubo_formulator import qubo_engine

router = APIRouter(prefix="/optimization", tags=["Optimization"])

class RunOptimizationRequest(BaseModel):
    max_investigations: int = 50

@router.post("/benchmark", response_model=Dict[str, Any])
async def run_optimization_benchmark(req: RunOptimizationRequest):
    """Executes side-by-side benchmark comparing Classical ILP vs Quantum QUBO Annealer."""
    candidates = elliptic_loader.get_candidates(limit=1000)
    constraints = ConstraintSpec(max_investigations=req.max_investigations)

    classical_res = qubo_engine.solve_classical(candidates, constraints)
    quantum_res = qubo_engine.solve_quantum_qubo(candidates, constraints)

    return {
        "max_investigations": req.max_investigations,
        "total_candidates": len(candidates),
        "classical": classical_res.model_dump(),
        "quantum": quantum_res.model_dump()
    }
