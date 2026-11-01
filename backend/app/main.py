import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base
from app.routes import auth, events, budgets, expenses, tasks, vendors, ai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eventease")

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI-powered luxury & enterprise event planning platform."
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(events.router, prefix=api_prefix)
app.include_router(budgets.router, prefix=api_prefix)
app.include_router(expenses.router, prefix=api_prefix)
app.include_router(tasks.router, prefix=api_prefix)
app.include_router(vendors.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_integration": "active" if bool(settings.GEMINI_API_KEY) else "smart_fallback_active"
    }

# Frontend static files mounting for single-container production deployment
possible_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
    "/app/frontend/dist",
    "/app/dist"
]

frontend_dist = next((d for d in possible_dist_dirs if os.path.isdir(d)), None)

if frontend_dist:
    logger.info(f"Serving static frontend build from: {frontend_dist}")
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes or health
        if full_path.startswith("api/") or full_path == "health" or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to EventEase AI API",
            "docs": "/docs",
            "health": "/health"
        }
