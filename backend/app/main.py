import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.database import engine, Base
from app.routes import auth, events, budgets, expenses, tasks, vendors, ai
from app.utils.security_middleware import SecurityHeadersMiddleware
from app.utils.rate_limiter import RateLimitMiddleware

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

# 1. Performance: GZip Compression Middleware (Compresses responses >= 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. Security: OWASP Security Headers & Process Time Tracing Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 3. Security: Sliding Window Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware, max_requests=150, window_seconds=60)

# 4. CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global Standardized Error Handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_type": "ValidationError",
            "message": "Invalid request parameters provided.",
            "details": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_type": "InternalServerError",
            "message": "An unexpected error occurred. Please contact support or retry."
        }
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
        "gemini_integration": "active" if bool(settings.GEMINI_API_KEY) else "smart_fallback_active",
        "security_hardening": "active",
        "rate_limiting": "enabled",
        "compression": "gzip"
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
        # Don't intercept API routes, health, or docs
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
