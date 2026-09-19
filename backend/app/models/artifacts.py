from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AgentMetadata(BaseModel):
    id: str
    name: str
    avatar: str  # Minecraft character sprite key
    role: str
    description: str
    color: str
    status: str = "idle"  # idle, active, completed, error

class TransactionRecord(BaseModel):
    tx_id: str
    time_step: int
    amount: float
    features: List[float]
    label: str = "unknown"  # licit, illicit, unknown

class RiskArtifact(BaseModel):
    entity_id: str
    risk_score: float  # 0.0 to 1.0
    risk_level: str    # LOW, MEDIUM, HIGH, CRITICAL
    top_risk_factors: List[str]

class GraphArtifact(BaseModel):
    node_id: str
    degree: int
    centrality: float
    cluster_id: int
    connected_entities_count: int

class FinancialImpactArtifact(BaseModel):
    case_id: str
    risk_score: float
    network_score: float
    financial_impact_usd: float
    priority_score: float

class CaseCandidate(BaseModel):
    case_id: str
    entity_id: str
    risk_score: float
    network_score: float
    financial_impact_usd: float
    cluster_id: int
    connected_count: int

class ConstraintSpec(BaseModel):
    max_investigations: int = 50
    total_candidates: int = 1000
    investigation_budget_usd: float = 25000.0
    max_cases_per_investigator: int = 5

class OptimizationResult(BaseModel):
    solver_name: str
    objective_value: float
    selected_cases: List[CaseCandidate]
    total_financial_impact_usd: float
    network_coverage_pct: float
    constraint_violations: int
    execution_time_ms: float

class EvaluationReport(BaseModel):
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    financial_efficiency: float
    overall_reward: float

class WorkflowStep(BaseModel):
    step_id: str
    agent_id: str
    agent_name: str
    status: str
    input_summary: str
    output_summary: str
    timestamp: str

class WorkflowExecutionState(BaseModel):
    execution_id: str
    goal: str
    current_version: int
    workflow_dag: List[str]
    steps: List[WorkflowStep]
    candidates: List[CaseCandidate]
    classical_result: Optional[OptimizationResult] = None
    quantum_result: Optional[OptimizationResult] = None
    reward_score: float = 0.0
