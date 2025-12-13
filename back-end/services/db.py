"""
Serviço de Banco de Dados (Firestore)
Funções de leitura/escrita no Firebase
"""
from firebase_config import db
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid

# Importa Query apenas se Firebase estiver disponível
if db:
    from google.cloud.firestore import Query
    try:
        from google.api_core import exceptions as google_exceptions
    except ImportError:
        # google.api_core pode não estar disponível em todas as versões
        google_exceptions = None
else:
    Query = None
    google_exceptions = None

# ============================================
# FUNÇÕES AUXILIARES
# ============================================

def _is_database_not_found_error(error: Exception) -> bool:
    """
    Verifica se o erro é relacionado ao banco de dados não ter sido criado
    
    Args:
        error: Exceção capturada
        
    Returns:
        True se for erro de banco não encontrado
    """
    error_str = str(error)
    return (
        "does not exist" in error_str or 
        "404" in error_str or
        (google_exceptions and isinstance(error, google_exceptions.NotFound))
    )

def _raise_database_not_found_error():
    """
    Levanta exceção com mensagem clara sobre banco não criado
    """
    raise Exception(
        "Banco de dados Firestore não foi criado. "
        "Acesse: https://console.cloud.google.com/firestore/databases?project=sandboxcaixa-84951"
    )

# ============================================
# OPERAÇÕES COM IDEIAS
# ============================================

def create_new_idea(user_id: str, title: str = "Nova Ideia") -> Dict[str, Any]:
    """
    Cria uma nova ideia para o usuário
    
    Args:
        user_id: ID do usuário
        title: Título inicial da ideia
        
    Returns:
        Dicionário com os dados da ideia criada
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    idea_id = str(uuid.uuid4())
    idea_data = {
        "user_id": user_id,
        "title": title,
        "description": "",
        "target_audience": "",
        "status": "draft",
        "dynamic_content": {},
        "created_at": datetime.now(),
        "last_updated": datetime.now()
    }
    
    doc_ref = db.collection('users').document(user_id)\
                .collection('ideas').document(idea_id)
    
    try:
        doc_ref.set(idea_data)
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise
    
    return {**idea_data, "id": idea_id}

def autosave_idea(user_id: str, idea_id: str, data: dict) -> Dict[str, Any]:
    """
    Atualiza apenas os campos que mudaram (Patch/Merge)
    Estratégia de Lazy Save para otimizar performance
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        data: Dicionário com os campos a atualizar
        
    Returns:
        Dados atualizados da ideia
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    doc_ref = db.collection('users').document(user_id)\
                .collection('ideas').document(idea_id)
    
    # Adiciona timestamp de modificação
    data['last_updated'] = datetime.now()
    
    # merge=True é crucial: só atualiza os campos enviados
    try:
        doc_ref.set(data, merge=True)
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise
    
    return data

def get_idea(user_id: str, idea_id: str) -> Optional[Dict[str, Any]]:
    """
    Busca uma ideia específica
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        
    Returns:
        Dicionário com os dados da ideia ou None se não existir
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    try:
        doc = db.collection('users').document(user_id)\
                .collection('ideas').document(idea_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            data['id'] = idea_id
            return data
        return None
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise

def get_idea_context(user_id: str, idea_id: str) -> Dict[str, Any]:
    """
    Lê os dados da ideia para a IA entender o contexto
    Usado antes de gerar respostas do JuniBox
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        
    Returns:
        Dicionário com os dados da ideia (vazio se não existir)
    """
    if not db:
        return {}
    
    try:
        doc = db.collection('users').document(user_id)\
                .collection('ideas').document(idea_id).get()
        
        return doc.to_dict() if doc.exists else {}
    except Exception as e:
        if _is_database_not_found_error(e):
            # Para get_idea_context, retorna vazio ao invés de erro
            return {}
        raise

def list_user_ideas(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Lista todas as ideias de um usuário
    
    Args:
        user_id: ID do usuário
        limit: Número máximo de ideias a retornar
        
    Returns:
        Lista de dicionários com as ideias (vazia se não houver ideias ou Firebase não configurado)
    """
    if not db:
        # Retorna lista vazia se Firebase não estiver configurado
        # Isso permite que o frontend funcione mesmo sem Firebase
        print("[AVISO] Firebase não configurado. Retornando lista vazia de ideias.")
        return []
    
    try:
        docs = db.collection('users').document(user_id)\
                 .collection('ideas')\
                 .order_by('last_updated', direction=Query.DESCENDING)\
                 .limit(limit).stream()
        
        ideas = []
        for doc in docs:
            idea_data = doc.to_dict()
            idea_data['id'] = doc.id
            ideas.append(idea_data)
        
        return ideas
    except Exception as e:
        if _is_database_not_found_error(e):
            # Para list_user_ideas, retorna lista vazia ao invés de erro
            print(f"[AVISO] Banco de dados Firestore não foi criado. Retornando lista vazia.")
            return []
        # Se houver erro ao buscar (ex: coleção não existe), retorna lista vazia
        print(f"[AVISO] Erro ao buscar ideias: {e}. Retornando lista vazia.")
        return []

def delete_idea(user_id: str, idea_id: str) -> bool:
    """
    Deleta uma ideia e todo seu histórico de chat
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        
    Returns:
        True se deletado com sucesso
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    # Deleta o documento da ideia
    # O Firestore não deleta sub-coleções automaticamente
    # Em produção, considere usar Cloud Functions para isso
    doc_ref = db.collection('users').document(user_id)\
                .collection('ideas').document(idea_id)
    
    try:
        doc_ref.delete()
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise
    
    return True

# ============================================
# OPERAÇÕES COM CHAT
# ============================================

def save_chat_message(user_id: str, idea_id: str, role: str, content: str) -> str:
    """
    Salva uma mensagem no histórico de chat
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        role: "user" ou "assistant"
        content: Conteúdo da mensagem
        
    Returns:
        ID da mensagem criada
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    message_data = {
        "role": role,
        "content": content,
        "timestamp": datetime.now()
    }
    
    try:
        doc_ref = db.collection('users').document(user_id)\
                    .collection('ideas').document(idea_id)\
                    .collection('chat').add(message_data)
        
        return doc_ref[1].id
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise

def get_chat_history(user_id: str, idea_id: str, limit: int = 10) -> List[Dict[str, str]]:
    """
    Busca o histórico de chat de uma ideia
    Retorna as últimas N mensagens em ordem cronológica
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        limit: Número máximo de mensagens a retornar
        
    Returns:
        Lista de dicionários com role e content
    """
    if not db:
        return []
    
    try:
        # Usar order_by DESC + limit + get() ao invés de limit_to_last().stream()
        # Depois inverter a ordem para manter ordem cronológica
        docs = db.collection('users').document(user_id)\
                 .collection('ideas').document(idea_id)\
                 .collection('chat')\
                 .order_by('timestamp', direction=Query.DESCENDING)\
                 .limit(limit).get()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            history.append({
                "role": data['role'],
                "content": data['content']
            })
        
        # Inverter para manter ordem cronológica (mais antiga primeiro)
        history.reverse()
        
        return history
    except Exception as e:
        if _is_database_not_found_error(e):
            # Para get_chat_history, retorna lista vazia ao invés de erro
            return []
        raise

def get_full_chat_history(user_id: str, idea_id: str) -> List[Dict[str, Any]]:
    """
    Busca o histórico completo de chat com timestamps
    Usado para exibir no frontend
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        
    Returns:
        Lista completa de mensagens com todos os dados
    """
    if not db:
        return []
    
    try:
        docs = db.collection('users').document(user_id)\
                 .collection('ideas').document(idea_id)\
                 .collection('chat')\
                 .order_by('timestamp', direction=Query.ASCENDING)\
                 .stream()
        
        messages = []
        for doc in docs:
            data = doc.to_dict()
            # Converter timestamp do Firestore para datetime ISO string
            timestamp = data.get('timestamp')
            if timestamp:
                # Se for um objeto Timestamp do Firestore, converter para datetime
                if hasattr(timestamp, 'to_datetime'):
                    timestamp = timestamp.to_datetime()
                elif hasattr(timestamp, 'timestamp'):
                    # Se for um objeto com método timestamp(), converter
                    timestamp = datetime.fromtimestamp(timestamp.timestamp())
                elif isinstance(timestamp, datetime):
                    # Já é datetime, usar diretamente
                    pass
                else:
                    # Tentar converter string ou outro formato
                    try:
                        if isinstance(timestamp, str):
                            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        else:
                            timestamp = datetime.now()
                    except:
                        timestamp = datetime.now()
            else:
                timestamp = datetime.now()
            
            messages.append({
                "id": doc.id,
                "role": data['role'],
                "content": data['content'],
                "timestamp": timestamp
            })
        
        return messages
    except Exception as e:
        if _is_database_not_found_error(e):
            # Para get_full_chat_history, retorna lista vazia ao invés de erro
            return []
        raise

def clear_chat_history(user_id: str, idea_id: str) -> bool:
    """
    Limpa todo o histórico de chat de uma ideia
    
    Args:
        user_id: ID do usuário
        idea_id: ID da ideia
        
    Returns:
        True se limpo com sucesso
    """
    if not db:
        raise Exception("Firebase não está configurado")
    
    try:
        # Busca todas as mensagens
        docs = db.collection('users').document(user_id)\
                 .collection('ideas').document(idea_id)\
                 .collection('chat').stream()
        
        # Deleta cada mensagem
        for doc in docs:
            doc.reference.delete()
        
        return True
    except Exception as e:
        if _is_database_not_found_error(e):
            _raise_database_not_found_error()
        raise

