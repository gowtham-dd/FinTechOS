from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import agents, dataset, optimization, deployment, quant_router, assistant_router, terminal_router
from app.memory.store import memory_store

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Quantitative Financial Research & Overfitting Audit Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await memory_store.init_store()

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "Quantitative Financial Research & Overfitting Audit Engine",
        "version": "1.0.0",
        "docs": "/docs"
    }

app.include_router(quant_router.router, prefix=settings.API_V1_STR)
app.include_router(assistant_router.router, prefix=settings.API_V1_STR)
app.include_router(terminal_router.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(dataset.router, prefix=settings.API_V1_STR)
app.include_router(optimization.router, prefix=settings.API_V1_STR)
app.include_router(deployment.router, prefix=settings.API_V1_STR)
