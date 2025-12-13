"""
JuniBox Backend - FastAPI + Firebase + Groq AI
Entrada principal da aplicação
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ideas, chat
from agents.filtrador import router as filtrador_router
from agents.ideia import router as ideia_router

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
    return {"status": "healthy", "service": "JuniBox Backend"}

# Para rodar direto pelo arquivo (opcional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

