"""
Inicialização do Firebase
Firebase é OPCIONAL - o servidor funciona sem ele para o chat simplificado
"""
import os
from app_config import FIREBASE_CREDENTIALS_PATH

# Tenta importar Firebase (pode não estar instalado ou configurado)
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_admin = None
    firestore = None

# Inicialização única do Firebase
def initialize_firebase():
    """
    Inicializa o Firebase Admin SDK
    Retorna o cliente do Firestore ou None se não estiver disponível
    """
    if not FIREBASE_AVAILABLE:
        print("[INFO] Firebase Admin SDK nao disponivel. Endpoints com Firebase nao funcionarao.")
        return None
    
    if not firebase_admin._apps:
        # Verifica se o arquivo de credenciais existe
        if os.path.exists(FIREBASE_CREDENTIALS_PATH):
            try:
                cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
                firebase_admin.initialize_app(cred)
                print("[OK] Firebase inicializado com sucesso")
                return firestore.client()
            except Exception as e:
                print(f"[AVISO] Erro ao inicializar Firebase com credenciais: {e}")
                print("[INFO] Chat simplificado funcionara sem Firebase")
                return None
        else:
            # Firebase não configurado - isso é OK para o chat simplificado
            print("[INFO] Firebase nao configurado (firebase_credentials.json nao encontrado)")
            print("[INFO] Chat simplificado funcionara sem Firebase")
            return None
    
    try:
        return firestore.client()
    except Exception as e:
        print(f"[AVISO] Erro ao obter cliente Firestore: {e}")
        return None

# Cliente global do Firestore (None se Firebase não estiver disponível)
db = initialize_firebase()
