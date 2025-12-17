"""
Sistema de Inovação Inteligente - FastAPI Backend
Orquestrador de Inovação com Agentes Cognitivos
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
from contextlib import asynccontextmanager

from routers import ideas, chat
from config.settings import settings
from services.firebase_client import get_firebase_client

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialização e limpeza da aplicação"""
    # Startup
    print("🚀 Iniciando Innovation Orchestrator...")
    print(f"🤖 Groq API: {'✅ Configurado' if settings.GROQ_API_KEY else '❌ Não configurado'}")
    
    # Mostrar configuração CORS
    cors_origins_list = settings.CORS_ORIGINS.copy()
    if "http://localhost:3000" not in cors_origins_list:
        cors_origins_list.append("http://localhost:3000")
    if "http://127.0.0.1:3000" not in cors_origins_list:
        cors_origins_list.append("http://127.0.0.1:3000")
    print(f"🌐 CORS: Origens permitidas: {cors_origins_list}")
    if settings.DEBUG:
        print("🌐 CORS: Modo DEBUG - Permitindo todas as origens (*)")
    
    # Verificar Firebase
    try:
        firebase = get_firebase_client()
        if firebase.is_initialized():
            print(f"🔥 Firebase: ✅ Configurado (Projeto: {settings.FIREBASE_PROJECT_ID})")
        else:
            print("🔥 Firebase: ⚠️ Inicializado mas não verificado")
    except Exception as e:
        print(f"🔥 Firebase: ❌ Erro - {str(e)}")
    
    yield
    # Shutdown
    print("👋 Encerrando Innovation Orchestrator...")

# Criar aplicação FastAPI
app = FastAPI(
    title="Innovation Orchestrator API",
    description="Sistema de Inovação Inteligente com Agentes Cognitivos",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware - DEVE SER ADICIONADO ANTES DE QUALQUER OUTRO MIDDLEWARE
# Garantir que localhost:3000 está sempre incluído
cors_origins = settings.CORS_ORIGINS.copy()
if "http://localhost:3000" not in cors_origins:
    cors_origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in cors_origins:
    cors_origins.append("http://127.0.0.1:3000")

# Em desenvolvimento, permitir todas as origens localhost
# Em produção, usar lista específica
if settings.DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Permitir todas em desenvolvimento
        allow_credentials=False,  # Não pode usar * com credentials
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

# Exception handlers para garantir que CORS seja aplicado mesmo em erros
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handler para exceções HTTP que garante CORS"""
    origin = request.headers.get("origin", "http://localhost:3000")
    # Em desenvolvimento, sempre permitir localhost
    if settings.DEBUG or "localhost" in origin or "127.0.0.1" in origin:
        allowed_origin = origin
    elif origin in cors_origins:
        allowed_origin = origin
    else:
        allowed_origin = cors_origins[0] if cors_origins else "*"
    
    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if hasattr(exc, 'detail') else str(exc)},
        headers=headers
    )

@app.exception_handler(HTTPException)
async def fastapi_http_exception_handler(request: Request, exc: HTTPException):
    """Handler para exceções HTTP do FastAPI que garante CORS"""
    origin = request.headers.get("origin", "http://localhost:3000")
    # Em desenvolvimento, sempre permitir localhost
    if settings.DEBUG:
        allowed_origin = "*"
    elif "localhost" in origin or "127.0.0.1" in origin:
        allowed_origin = origin
    elif origin in cors_origins:
        allowed_origin = origin
    else:
        allowed_origin = cors_origins[0] if cors_origins else "*"
    
    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Credentials": "false" if allowed_origin == "*" else "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para erros de validação que garante CORS"""
    origin = request.headers.get("origin", "http://localhost:3000")
    # Em desenvolvimento, sempre permitir localhost
    if settings.DEBUG:
        allowed_origin = "*"
    elif "localhost" in origin or "127.0.0.1" in origin:
        allowed_origin = origin
    elif origin in cors_origins:
        allowed_origin = origin
    else:
        allowed_origin = cors_origins[0] if cors_origins else "*"
    
    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Credentials": "false" if allowed_origin == "*" else "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=headers
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handler genérico para garantir CORS em todos os erros"""
    origin = request.headers.get("origin", "http://localhost:3000")
    # Em desenvolvimento, sempre permitir localhost
    if settings.DEBUG:
        allowed_origin = "*"
    elif "localhost" in origin or "127.0.0.1" in origin:
        allowed_origin = origin
    elif origin in cors_origins:
        allowed_origin = origin
    else:
        allowed_origin = cors_origins[0] if cors_origins else "*"
    
    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Credentials": "false" if allowed_origin == "*" else "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
    }
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erro interno do servidor: {str(exc)}"},
        headers=headers
    )

# Handler para OPTIONS requests (preflight CORS)
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handler para requisições OPTIONS (preflight CORS)"""
    origin = request.headers.get("origin", "http://localhost:3000")
    # Em desenvolvimento, sempre permitir localhost
    if settings.DEBUG:
        allowed_origin = "*"
    elif "localhost" in origin or "127.0.0.1" in origin:
        allowed_origin = origin
    elif origin in cors_origins:
        allowed_origin = origin
    else:
        allowed_origin = cors_origins[0] if cors_origins else "*"
    
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Credentials": "false" if allowed_origin == "*" else "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

# Incluir routers
app.include_router(ideas.router, prefix="/api", tags=["Ideias"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Innovation Orchestrator",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check detalhado"""
    firebase_status = "not_configured"
    try:
        firebase = get_firebase_client()
        firebase_status = "configured" if firebase.is_initialized() else "error"
    except Exception:
        firebase_status = "error"
    
    return {
        "status": "healthy",
        "components": {
            "api": "online",
            "groq": "configured" if settings.GROQ_API_KEY else "not_configured",
            "firebase": firebase_status
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

