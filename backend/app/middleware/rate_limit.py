"""
Middleware para rate limiting en la API
Protege contra abuso y controla uso por plan
"""

import time
from functools import wraps
from fastapi import Request, HTTPException
from typing import Dict, List
import threading

# Almacenamiento en memoria para rate limiting (en producción usar Redis)
request_counts: Dict[str, List[float]] = {}
lock = threading.Lock()

class RateLimiter:
    """Rate limiter simple en memoria"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
    
    def is_allowed(self, key: str) -> bool:
        """Verifica si la petición está dentro del límite"""
        now = time.time()
        window_start = now - 60  # ventana de 1 minuto
        
        with lock:
            if key not in request_counts:
                request_counts[key] = []
            
            # Limpiar peticiones antiguas
            request_counts[key] = [t for t in request_counts[key] if t > window_start]
            
            # Verificar límite
            if len(request_counts[key]) >= self.requests_per_minute:
                return False
            
            # Registrar nueva petición
            request_counts[key].append(now)
            return True
    
    def get_remaining(self, key: str) -> int:
        """Retorna cuántas peticiones quedan"""
        now = time.time()
        window_start = now - 60
        
        with lock:
            if key not in request_counts:
                return self.requests_per_minute
            
            request_counts[key] = [t for t in request_counts[key] if t > window_start]
            return max(0, self.requests_per_minute - len(request_counts[key]))

# Instancias por plan
limiters = {
    "starter": RateLimiter(requests_per_minute=10),
    "pro": RateLimiter(requests_per_minute=100),
    "enterprise": RateLimiter(requests_per_minute=1000),
}

def rate_limit_by_ip(plan: str = "starter"):
    """Decorador para rate limiting por IP"""
    limiter = limiters.get(plan, limiters["starter"])
    
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Obtener IP del cliente
            client_ip = request.client.host if request.client else "unknown"
            key = f"{client_ip}:{plan}"
            
            if not limiter.is_allowed(key):
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Try again in {60 - int(time.time() % 60)} seconds."
                )
            
            # Añadir headers de rate limit
            remaining = limiter.get_remaining(key)
            response = await func(request, *args, **kwargs)
            
            # Si la respuesta es un dict, envolver en Response
            from fastapi.responses import JSONResponse
            if isinstance(response, dict):
                return JSONResponse(
                    content=response,
                    headers={
                        "X-RateLimit-Limit": str(limiter.requests_per_minute),
                        "X-RateLimit-Remaining": str(remaining),
                    }
                )
            return response
        return wrapper
    return decorator
