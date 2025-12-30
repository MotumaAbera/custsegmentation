from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.upload_path
    settings.output_path
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="ML-backed API for customer segmentation using hierarchical clustering",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(router, prefix="/api/v1")

