"""
JuniBox Backend - FastAPI + Firebase + Groq AI
Entrada principal da aplicação
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from routers import ideas, chat
from agents.filtrador import router as filtrador_router
from agents.ideia import router as ideia_router
import traceback
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuração da Documentação do Swagger
app = FastAPI(
    title="API JuniBox - CAIXA Sandbox",
    description="Backend responsável por avaliar ideias usando Llama 3 via Groq.",
    version="1.0.0"
)

# Configuração de CORS (Essencial para seu Front-end funcionar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, troque "*" pela URL do seu front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
# Rotas legadas (mantidas para compatibilidade)
app.include_router(chat.router, prefix="/api/chat", tags=["Chat (Legado)"])
app.include_router(ideas.router, prefix="/api/ideas", tags=["Ideas"])

# Rotas dos Agentes (nova arquitetura)
app.include_router(filtrador_router.router, prefix="/api/agents", tags=["Agente Filtrador"])
app.include_router(ideia_router.router, prefix="/api/agents", tags=["Agente de Ideia"])

@app.get("/", summary="Status da API")
def home():
    """Endpoint de status - verifica se a API está online"""
    return {
        "status": "online", 
        "message": "JuniBox API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health", summary="Health Check")
def health_check():
    """Endpoint de health check para monitoramento"""
    return {"status": "ok", "service": "JuniBox Backend"}

# Handler global de exceções
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handler global para capturar todas as exceções não tratadas
    """
    error_details = traceback.format_exc()
    error_type = type(exc).__name__
    error_message = str(exc)
    
    logger.error(f"Erro não tratado: {error_message}")
    logger.error(f"Tipo: {error_type}")
    logger.error(f"Detalhes:\n{error_details}")
    
    # Detectar tipo de erro específico
    if "authentication" in error_message.lower() or "api key" in error_message.lower() or "401" in error_message:
        error_message = "Erro de autenticação. Verifique suas credenciais."
    elif "rate limit" in error_message.lower() or "429" in error_message:
        error_message = "Limite de requisições excedido. Tente novamente em alguns instantes."
    elif "model" in error_message.lower() or "not found" in error_message.lower() or "does not exist" in error_message.lower():
        error_message = f"Recurso não disponível: {error_message}"
    elif "timeout" in error_message.lower():
        error_message = "Timeout na requisição. O servidor demorou muito para responder."
    
    return JSONResponse(
        status_code=500,
        content={
            "error": error_message,
            "error_type": error_type,
            "original_error": str(exc),
            "path": str(request.url)
        }
    )

# Handler para erros de validação
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler para erros de validação do Pydantic
    """
    return JSONResponse(
        status_code=422,
        content={
            "error": "Erro de validação",
            "message": "Os dados enviados são inválidos",
            "details": exc.errors()
        }
    )

# Para rodar direto pelo arquivo (opcional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

