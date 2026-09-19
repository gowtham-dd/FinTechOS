from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/deployment", tags=["Deployment"])

@router.get("/package", response_model=Dict[str, Any])
async def get_deployment_package():
    """Returns executable Python SDK snippet, REST API endpoint specs, and Dockerfile configuration."""
    python_sdk_snippet = '''# AgentOS Python SDK Example
import requests

class AgentOSClient:
    def __init__(self, api_url="http://localhost:8001/api/v1"):
        self.api_url = api_url

    def build_agent(self, goal: str, max_investigations: int = 50):
        res = requests.post(f"{self.api_url}/agents/build", json={
            "goal": goal,
            "max_investigations": max_investigations
        })
        return res.json()

client = AgentOSClient()
result = client.build_agent("Prioritize top 50 AML cases based on financial impact")
print("Selected Quantum Cases:", len(result['quantum_result']['selected_cases']))
'''

    dockerfile_content = '''FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml pyproject.toml
RUN pip install uv && uv pip install --system -r pyproject.toml
COPY app/ app/
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
'''

    return {
        "status": "ready",
        "version": "1.0.0",
        "python_sdk": python_sdk_snippet,
        "dockerfile": dockerfile_content,
        "rest_endpoint": "POST /api/v1/agents/build",
        "swagger_docs": "/docs"
    }
