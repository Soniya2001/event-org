import time
from collections import defaultdict
from starlette.responses import JSONResponse

class RateLimitMiddleware:
    """
    High-performance pure ASGI sliding-window rate limiter.
    Protects API endpoints against brute-force and resource exhaustion attacks.
    Allows 150 requests per minute per IP address, with 30 req/min for auth endpoints.
    """
    def __init__(self, app, max_requests: int = 150, window_seconds: int = 60):
        self.app = app
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_records = defaultdict(list)

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        # Whitelist static assets, health check, docs
        if path.startswith("/assets") or path == "/health" or not path.startswith("/api/"):
            await self.app(scope, receive, send)
            return

        client = scope.get("client")
        client_ip = client[0] if client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old records
        self.request_records[client_ip] = [
            t for t in self.request_records[client_ip] if t > window_start
        ]

        # Determine threshold
        limit = self.max_requests
        if "/auth/login" in path or "/auth/register" in path:
            limit = 30  # Stricter limit on auth routes

        if len(self.request_records[client_ip]) >= limit:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down and try again shortly."}
            )
            await response(scope, receive, send)
            return

        self.request_records[client_ip].append(now)

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"x-ratelimit-limit", str(limit).encode("latin-1")))
                remaining = max(0, limit - len(self.request_records[client_ip]))
                headers.append((b"x-ratelimit-remaining", str(remaining).encode("latin-1")))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)
