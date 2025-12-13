"""
Configurações e Variáveis de Ambiente
"""
import os
from dotenv import load_dotenv

# ============================================
# CREDENCIAIS
# ============================================
# ⚠️ NUNCA coloque credenciais diretamente no código!

# Define o caminho do arquivo de credenciais ANTES de carregar .env
# Isso garante que o caminho padrão seja usado se não houver variável de ambiente
_base_dir = os.path.dirname(os.path.abspath(__file__))
_default_creds_file = "sandboxcaixa-84951-firebase-adminsdk-fbsvc-b9035301e8.json"
_default_creds_path = os.path.join(_base_dir, _default_creds_file)

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Agora verifica se há variável de ambiente definida
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_firebase_creds_env = os.getenv("FIREBASE_CREDENTIALS_PATH")

# Ignora variável de ambiente se não for o arquivo correto
# Força o uso do arquivo de credenciais correto
if _firebase_creds_env and "sandboxcaixa-84951" in _firebase_creds_env:
    # Se for caminho absoluto, usa diretamente; senão, resolve relativo ao back-end
    if os.path.isabs(_firebase_creds_env):
        FIREBASE_CREDENTIALS_PATH = _firebase_creds_env
    else:
        FIREBASE_CREDENTIALS_PATH = os.path.join(_base_dir, _firebase_creds_env)
else:
    # Sempre usa o caminho padrão do arquivo correto
    FIREBASE_CREDENTIALS_PATH = _default_creds_path

# Validação: verifica se o arquivo existe
if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
    print(f"[AVISO] Arquivo de credenciais Firebase nao encontrado: {FIREBASE_CREDENTIALS_PATH}")
    print(f"   Verifique se o arquivo existe na pasta back-end/")

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

# NOTA: Prompts agora estão em agents/filtrador/prompts.py e agents/ideia/prompts.py

# ============================================
# CONFIGURAÇÕES DE AUTOSAVE
# ============================================
AUTOSAVE_DEBOUNCE_SECONDS = 3

