import time
import uuid

class SecurityHeadersMiddleware:
    """
    High-performance pure ASGI Security Headers & Distributed Tracing Middleware.
    OWASP Recommended Security Standards with zero thread-bridging overhead:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security: max-age=31536000; includeSubDomains
    - Referrer-Policy: strict-origin-when-cross-origin
    - Permissions-Policy: camera=(), microphone=(), geolocation=()
    - X-Request-ID: Distributed tracing UUID
    - X-Process-Time: High-resolution latency profiling
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())
        start_time = time.time()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                process_time = time.time() - start_time
                headers = list(message.get("headers", []))
                
                headers.append((b"x-request-id", request_id.encode("latin-1")))
                headers.append((b"x-process-time", f"{process_time:.4f}s".encode("latin-1")))
                headers.append((b"x-content-type-options", b"nosniff"))
                headers.append((b"x-frame-options", b"DENY"))
                headers.append((b"x-xss-protection", b"1; mode=block"))
                headers.append((b"strict-transport-security", b"max-age=31536000; includeSubDomains"))
                headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                headers.append((b"permissions-policy", b"camera=(), microphone=(), geolocation=()"))
                
                message["headers"] = headers

            await send(message)

        await self.app(scope, receive, send_wrapper)
