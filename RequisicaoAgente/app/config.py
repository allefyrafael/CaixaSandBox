# app/config.py
from dotenv import load_dotenv
import os

load_dotenv()  # carrega .env

def getenv_required(name: str) -> str:
    v = os.getenv(name, "").strip()
    if not v:
        raise RuntimeError(f"Variável de ambiente '{name}' não definida: {name}")
    return v

IBM_CLOUD_API_KEY = getenv_required("IBM_CLOUD_API_KEY")
BASE_URL = getenv_required("WXO_BASE_URL").rstrip("/")
AGENT_ID = getenv_required("WXO_AGENT_ID")

# IBM Cloud usa /v1 (não /api/v1)
if not BASE_URL.endswith("/v1"):
    BASE_URL = f"{BASE_URL}/v1"

IAM_URL = "https://iam.cloud.ibm.com/identity/token"
