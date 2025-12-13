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

def check_database_exists(db_client):
    """
    Verifica se o banco de dados Firestore existe
    
    Args:
        db_client: Cliente do Firestore
        
    Returns:
        True se o banco existe, False caso contrário
    """
    try:
        # Tenta ler uma coleção de teste (não cria nada)
        list(db_client.collection('_health_check').limit(1).stream())
        return True
    except Exception as e:
        error_str = str(e)
        if "does not exist" in error_str or "404" in error_str:
            return False
        # Outros erros são ignorados (pode ser permissão, etc)
        return True

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
                print(f"[OK] Firebase inicializado com sucesso usando: {FIREBASE_CREDENTIALS_PATH}")
                db_client = firestore.client()
                print("[OK] Cliente Firestore criado com sucesso")
                
                # Verifica se o banco de dados existe
                if not check_database_exists(db_client):
                    print("[AVISO] Banco de dados Firestore nao foi criado ainda.")
                    print("[AVISO] Acesse: https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951")
                    print("[AVISO] Endpoints que requerem Firebase nao funcionarao ate que o banco seja criado.")
                else:
                    print("[OK] Banco de dados Firestore verificado e funcionando")
                
                return db_client
            except Exception as e:
                print(f"[ERRO] Erro ao inicializar Firebase com credenciais: {e}")
                import traceback
                traceback.print_exc()
                print("[INFO] Chat simplificado funcionara sem Firebase")
                return None
        else:
            # Firebase não configurado - isso é OK para o chat simplificado
            print(f"[AVISO] Arquivo de credenciais nao encontrado: {FIREBASE_CREDENTIALS_PATH}")
            print(f"[INFO] Diretorio atual: {os.getcwd()}")
            print("[INFO] Chat simplificado funcionara sem Firebase")
            return None
    
    try:
        db_client = firestore.client()
        # Verifica se o banco de dados existe
        if not check_database_exists(db_client):
            print("[AVISO] Banco de dados Firestore nao foi criado ainda.")
            print("[AVISO] Acesse: https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951")
        return db_client
    except Exception as e:
        print(f"[AVISO] Erro ao obter cliente Firestore: {e}")
        return None

# Cliente global do Firestore (None se Firebase não estiver disponível)
db = initialize_firebase()
