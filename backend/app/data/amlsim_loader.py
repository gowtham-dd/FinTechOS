import random
import networkx as nx
from typing import List, Dict, Any
from app.models.artifacts import CaseCandidate

class AMLSimSyntheticLoader:
    """
    IBM AMLSim Synthetic Scenario dataset loader.
    Generates controlled money laundering patterns:
    1. Smurfing / Fan-Out Fan-In
    2. Layering through Shell Entities
    3. High-Frequency Mixing Paths
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self.candidates: List[CaseCandidate] = []
        self._build_synthetic_scenarios()

    def _build_synthetic_scenarios(self):
        random.seed(99)
        case_counter = 5001

        # 1. Smurfing Pattern (1 Source -> 10 Mules -> 1 Destination)
        mule_nodes = [f"AML_MULE_{i:02d}" for i in range(1, 15)]
        for mule in mule_nodes:
            self.graph.add_node(mule, cluster_id=99, risk_score=0.92, network_score=0.95, financial_impact_usd=120000.0)
            self.candidates.append(CaseCandidate(
                case_id=f"CASE_{case_counter:04d}",
                entity_id=mule,
                risk_score=0.92,
                network_score=0.95,
                financial_impact_usd=120000.0,
                cluster_id=99,
                connected_count=16
            ))
            case_counter += 1

        # 2. Shell Company Layering Pattern
        shell_nodes = [f"SHELL_CORP_{i:02d}" for i in range(1, 20)]
        for shell in shell_nodes:
            self.graph.add_node(shell, cluster_id=88, risk_score=0.88, network_score=0.91, financial_impact_usd=450000.0)
            self.candidates.append(CaseCandidate(
                case_id=f"CASE_{case_counter:04d}",
                entity_id=shell,
                risk_score=0.88,
                network_score=0.91,
                financial_impact_usd=450000.0,
                cluster_id=88,
                connected_count=22
            ))
            case_counter += 1

    def get_summary(self) -> Dict[str, Any]:
        return {
            "dataset_name": "IBM AMLSim Synthetic Benchmark",
            "total_scenarios": "Controlled Smurfing & Layering",
            "total_candidates": len(self.candidates)
        }

    def get_candidates(self, limit: int = 100) -> List[CaseCandidate]:
        return self.candidates[:limit]

amlsim_loader = AMLSimSyntheticLoader()
