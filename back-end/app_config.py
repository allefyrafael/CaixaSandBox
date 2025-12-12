"""
Configurações e Variáveis de Ambiente
"""
import os
from dotenv import load_dotenv
from config.prompts import SYSTEM_PROMPT

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# ============================================
# CREDENCIAIS
# ============================================
# ⚠️ NUNCA coloque credenciais diretamente no código!
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")

# Validação de credenciais essenciais
if not GROQ_API_KEY:
    print("⚠️  AVISO: GROQ_API_KEY não encontrada no arquivo .env")
    print("   Crie um arquivo .env na pasta back-end/ com suas credenciais")
    print("   Veja .env.example para referência")

# ============================================
# CONFIGURAÇÕES DO MODELO DE IA
# ============================================
MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0.2  # Baixa criatividade para seguir regras
MAX_HISTORY_MESSAGES = 10

# Prompt do sistema importado de config/prompts.py
# Para editar o prompt, modifique: config/prompts.py

# ============================================
# CONFIGURAÇÕES DE AUTOSAVE
# ============================================
AUTOSAVE_DEBOUNCE_SECONDS = 3

