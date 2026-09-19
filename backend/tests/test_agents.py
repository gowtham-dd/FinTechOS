import pytest
from app.data.elliptic_loader import elliptic_loader
from app.quantum.qubo_formulator import qubo_engine
from app.models.artifacts import ConstraintSpec

def test_elliptic_loader():
    summary = elliptic_loader.get_graph_summary()
    assert summary["total_nodes"] > 0
    assert summary["total_candidates"] > 0

def test_classical_vs_quantum_solver():
    candidates = elliptic_loader.get_candidates(limit=100)
    constraints = ConstraintSpec(max_investigations=20)
    
    classical_res = qubo_engine.solve_classical(candidates, constraints)
    quantum_res = qubo_engine.solve_quantum_qubo(candidates, constraints)
    
    assert classical_res.selected_cases != []
    assert quantum_res.selected_cases != []
    assert len(quantum_res.selected_cases) <= 20
    assert quantum_res.objective_value >= 0.0
