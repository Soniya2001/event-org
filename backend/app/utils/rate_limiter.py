import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window in-memory rate limiter middleware.
    Protects API endpoints against brute-force and resource exhaustion attacks.
    Allows 120 requests per minute per IP address, with stricter limits on auth endpoints.
    """
    def __init__(self, app, max_requests: int = 150, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_records = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Exclude static assets and health check from rate limits
        path = request.url.path
        if path.startswith("/assets") or path == "/health" or not path.startswith("/api/"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old requests
        self.request_records[client_ip] = [
            t for t in self.request_records[client_ip] if t > window_start
        ]

        # Determine threshold
        limit = self.max_requests
        if "/auth/login" in path or "/auth/register" in path:
            limit = 30  # Stricter limit on auth routes to prevent credential stuffing

        if len(self.request_records[client_ip]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again shortly."
            )

        self.request_records[client_ip].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(self.request_records[client_ip])))
        return response

