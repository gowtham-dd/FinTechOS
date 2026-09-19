# PRD — Quantum FinTech AgentOS

## 1. Product Name

### **Quantum FinTech AgentOS**
**AI Agent Factory for Financial Risk, Fraud & Decision Optimization**

### One-line Pitch
> **A platform that converts financial objectives into executable AI agents, evaluates them on real financial data, automatically improves their workflows, and uses quantum/quantum-inspired optimization when the problem requires constrained decision-making.**

Flagship Demonstration:
> **AI-powered AML investigation prioritization using real-world Bitcoin transaction networks + quantum optimization.**

---

## 2. The Problem

Financial institutions and financial-crime teams face three major problems:

1. **Too many transactions**: Financial systems contain enormous numbers of transactions; manual inspection of everything is impossible.
2. **Suspicious transactions are connected**: Looking at transactions independently misses the bigger picture (e.g. Wallet A → B → C → D → Exchange). The graph/network as a whole could be highly suspicious.
3. **Investigation resources are limited**: Given 1,000 suspicious candidates and only 50 investigators, which 50 cases should be investigated? This is a **constrained combinatorial optimization problem**, where quantum/quantum-inspired algorithms excel.

---

## 3. Solution Overview

### Layer A — Agent Factory
Converts natural language financial objectives (e.g., *"Create an AML agent that prioritizes 50 investigations from 1,000 suspicious cases based on financial impact and network risk"*) into executable agents:
`Goal` → `Required Capabilities` → `Agent Workflow` → `Tools` → `Evaluator` → `Optimization Strategy` → `Executable Agent`.

### Layer B — Financial Agent Runtime
Executes the generated DAG workflow:
`Data` → `Risk Analysis` → `Graph Analysis` → `Network Detection` → `Financial Impact` → `Candidate Generation` → `Optimization` → `Investigation Ranking` → `Investigator Dashboard`.

---

## 4. Architecture & Agent Ecosystem

Agents communicate via **structured JSON artifacts** (deterministic & auditable), not conversational chat:

```json
{
  "case_id": "TX_10482",
  "risk_score": 0.91,
  "network_score": 0.87,
  "financial_impact": 820000,
  "recommended_action": "investigate"
}
```

### Specialized Agents Overview (16 Agents):
1. **Data Ingestion Agent**: Ingests Elliptic BTC data, CSV, SQL, APIs.
2. **Data Quality Agent**: Validates schema, distributions, missing values, timestamp consistency.
3. **Transaction Risk Agent**: ML risk scoring at individual transaction/entity level (0 to 1 risk score).
4. **Graph Intelligence Agent**: Builds network graph (nodes=entities, edges=txs), degree, centrality, connected components, community detection.
5. **Network Risk Agent**: Aggregates entity-level risk with graph topology to compute network-level risk score.
6. **Financial Impact Agent**: Estimates potential monetary value/loss at risk for prioritizing impact.
7. **Investigation Candidate Agent**: Filters and generates candidate investigation cases (e.g., top 1,000 candidates).
8. **Constraint Agent**: Defines operational & capacity bounds (e.g., max 50 cases, budget limit, investigator capacity).
9. **Optimization Agent**: Formulates decision mathematical model ($\max \sum x_i R_i$ subject to $\sum x_i \le K$).
10. **Quantum Optimization Agent**: Maps problem to QUBO/HUBO/Ising formulation and calls Quantum / Quantum-inspired solvers (Qiskit, PyQUBO, Simulated Annealing, Fujitsu Digital Annealer / D-Wave API).
11. **Classical Optimization Agent**: Baseline solver (PuLP, SciPy, OR-Tools, ILP) for benchmark comparison.
12. **Evaluation Agent**: Evaluates precision, recall, F1, financial impact captured, network coverage, constraint compliance, and runtime.
13. **Reward Agent**: Computes scalar reward signal combining financial impact, risk quality, coverage, and constraint penalty.
14. **Workflow Optimizer**: Iteratively mutates & tests workflow topologies (Reward-driven DAG optimization).
15. **Explanation / Audit Agent**: Generates plain-English audit trails explaining why specific cases were selected.
16. **Deployment Agent**: Packages optimized workflow into REST APIs, SDKs, or JSON configs.

---

## 5. Data Strategy

* **Primary Dataset (Elliptic BTC Dataset)**: Real-world Bitcoin transaction graph (203K+ nodes, 234K+ edges, 166 features, 49 time steps). Demonstrates real blockchain transaction network intelligence.
* **Secondary Dataset (IBM AMLSim)**: Synthetic benchmark dataset for controlled testing of specific AML topology patterns.

---

## 6. Quantum Decision Formulation

* **Variables**: $x_i \in \{0, 1\}$ for candidate case $i$.
* **Objective**:
  $$\max \sum_{i} x_i R_i - \lambda_{\text{red}} \sum_{i,j} x_i x_j S_{ij}$$
  where $R_i$ is composite risk/impact score, and $S_{ij}$ is cluster redundancy overlap.
* **Constraints**: $\sum_{i} x_i \le K$ (Investigator capacity constraint penalty in QUBO).
* **Solvers Compared**: Classical ILP / OR-Tools vs. Quantum / Quantum-Inspired Annealers.

---

## 7. Demo UI & User Experience (5 Core Screens)

1. **Agent Factory Screen**: Prompt input ("Build an AML agent..."), objective parsing, and workflow preview.
2. **Generated Agent Screen**: Visualizing capability DAG, tool assignments, and constraint parameters.
3. **Workflow Optimization Lab**: Multi-version comparison (V1 to V4) showing reward growth.
4. **AML Investigation Dashboard**: Real transaction graph visualization with suspicious node/cluster highlights.
5. **Optimization & Benchmark Result**: Classical vs. Quantum side-by-side performance table & Case Explanation modal.

---

## 8. Financial Governance & Safety

The system serves strictly as **Decision-Support Software (Human-in-the-loop)**. It generates prioritized recommendations and audit trails for human compliance officers; it does not automatically execute account freezes or legal actions.
